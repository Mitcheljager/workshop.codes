class PostsController < ApplicationController
  require "httparty"

  include EmailNotificationsHelper
  include NotificationsHelper

  before_action :set_post, only: [:edit, :update, :destroy, :immortalise]
  before_action :set_post_images, only: [:edit]

  before_action only: [:edit, :update, :destroy, :immortalise] do
    if @post.present?
      return redirect_to login_path unless current_user
      redirect_to post_path(@post.code), flash: { error: "You are not authorized to perform that action" } unless current_user == @post.user
    else
      redirect_to root_path
    end
  end

  before_action :set_order, only: [:category, :hero, :map]

  before_action only: [:create, :new] do
    redirect_to login_path unless current_user
  end

  after_action :track_action, only: [:show]

  def index
    @hot_posts = Post.includes(:user).select_overview_columns.public?.where("hotness > 1").order("hotness DESC").limit(10) unless params[:page].present?
    @posts = Post.includes(:user).select_overview_columns.public?.order(created_at: :desc).page params[:page]

    respond_to do |format|
      format.html
      format.js { render "posts/infinite_scroll_posts" }
      format.json {
        set_request_headers
        render json: @posts
      }
    end
  end

  def show
    @post = Post.includes(:user, :collection, :revisions, :blocks, :derivations).find_by_code(params[:code])

    not_found and return if @post && (@post.private? || @post.draft?) && @post.user != current_user

    respond_to do |format|
      format.html {
        unless @post.present?
          revision = Revision.select(:post_id, :code).find_by("upper(code) = ?", params[:code].upcase)

          if revision
            @post = revision.post
            redirect_to post_path(revision.post.code)
          end
        end

        not_found and return unless @post.present?

        @comments_count = @post.comments.size
        @revisions_count = @post.revisions.where(visible: true).size
        @derivations_count = @post.derivations.size

        set_post_images
      }
      format.json {
        set_request_headers
        render json: @post
      }
    end
  end

  def redirect_nice_url
    @post = Post.visible?.find_by_nice_url!(params[:nice_url].downcase)

    track_action("Redirect Post Nice URL")

    redirect_to post_path(@post.code)
  end

  def new
    @post = Post.new
  end

  def edit
  end

  def parse_markdown
    content = post_params[:description] || post_params[:content]
    parsed_markdown = sanitized_markdown(content.to_s)

    render json: parsed_markdown, layout: false
  end

  def get_snippet
    @post = Post.select(:snippet, :private, :user_id).find(params[:id])
    @post = nil if @post.private? && current_user.id != @post.user_id

    render plain: @post.snippet
  end

  def create
    @post = Post.new(post_params)
    @post.user_id = current_user.id
    @post.locale = current_locale
    @post.last_revision_created_at = Time.now

    set_post_status
    parse_carousel_video

    if @post.save
      unless parse_derivatives
        respond_to do |format|
          format.html { render :new }
          format.js { render "validation" }
        end
        return
      end
      @revision = Revision.new(post_id: @post.id, code: @post.code, version: @post.version, snippet: @post.snippet).save

      create_activity(:create_post, post_activity_params)
      create_email_notification(:will_expire, @post.id, post_params[:email]) if email_notification_enabled
      create_collection if post_params[:new_collection] != ""
      update_blocks

      notify_discord("New")

      flash[:notice] = "Post successfully created" # FIXME: i18n
      redirect_to post_path(@post.code)
    else
      respond_to do |format|
        format.html { render :new }
        format.js { render "validation" }
      end
    end
  end

  def update
    params[:post][:nice_url] = "" if post_params[:include_nice_url] == "0"
    params[:post][:email] = "" if post_params[:email_notification] == "0"

    @was_draft = @post.draft?

    current_version = @post.version
    current_code = @post.code

    set_post_status
    parse_carousel_video

    if @post.update(post_params)
      unless parse_derivatives
        respond_to do |format|
          format.html { render :new }
          format.js { render "validation" }
        end
        return
      end
      create_activity(:update_post, post_activity_params)
      create_collection if post_params[:new_collection] != ""
      update_email_notifications
      update_blocks
      update_draft if @was_draft

      if (post_params[:revision].present? && post_params[:revision] != "0") || current_code != post_params[:code] || current_version != post_params[:version]
        invisible = (post_params[:revision].present? && post_params[:revision] == "0") ? 0 : 1
        @revision = Revision.new(post_id: @post.id, code: @post.code, version: @post.version, description: post_params[:revision_description], snippet: @post.snippet, visible: invisible)
        @post.update(last_revision_created_at: @revision.created_at) if @revision.save

        notify_discord("Update") unless published_from_draft
      end

      notify_discord("New") if published_from_draft

      flash[:notice] = "Post successfully edited" # FIXME: i18n
      redirect_to post_path(@post.code)
    else
      @post.code = current_code

      respond_to do |format|
        format.html { render :edit }
        format.js { render "validation" }
      end
    end
  end

  def immortalise
    if @post.update_attribute(:immortal, true)
      redirect_to post_path(@post.code)
    else
      render "application/error"
    end
  end

  def destroy
    @post.destroy
    create_activity(:destroy_post, post_activity_params)

    flash[:notice] = "Post successfully deleted" # FIXME: i18n
    redirect_to posts_url
  end

  def copy_code
    @post = Post.find_by_code(params[:code])
    unless @post.present?
      @revision = Revision.find_by("upper(code) = ?", params[:code].upcase)
      @post = @revision.post if @revision.present?
    end

    track_action("Copy Code") if @post.present?
  end

  def similar_to
    @post = Post.find(params[:id])
    @posts = ENV["BONSAI_URL"] ? Post.includes(:user).search(@post.tags.presence || @post.title, 4).records.where.not(id: @post.id).select_overview_columns.public?.limit(3) : Post.where.not(id: @post.id).last(3)

    if @posts.any?
      render collection: @posts, partial: "card", as: :post
    else
      render plain: "No similar posts were found" # FIXME: i18n
    end
  end

  private

  def set_post
    @post = Post.find_by_code(params[:code])
  end

  def set_post_images
    return unless @post.present? && @post.images.any?

    @image_ids = @post.image_order.present? ? @post.image_order : "[]"
    @ordered_images = JSON.parse(@image_ids).collect { |i| @post.images.find_by_blob_id(i) }
  end

  def create_collection
    nice_url = SecureRandom.alphanumeric(6).downcase
    @collection = Collection.create(user_id: current_user.id, title: post_params[:new_collection], nice_url: nice_url)

    @post.update(collection_id: @collection.id)
  end

  def set_order
    @order = params[:sort] ? "hotness DESC" : "updated_at DESC"
  end

  def set_post_status
    @post.unlisted = post_params[:status] == "unlisted"
    @post.private = post_params[:status] == "private"
    @post.draft = post_params[:status] == "draft"
  end

  def parse_carousel_video
    params[:post][:carousel_video] = youtube_to_video_id(post_params[:carousel_video])
  end

  def parse_derivatives
    return true unless params[:post][:derivatives]

    codes = params[:post][:derivatives].split(",")
    trimmed_codes = codes[0, Post::MAX_SOURCES]

    Derivative.where(derivation: @post).where.not(source_code: trimmed_codes).destroy_all

    trimmed_codes.each do |code|
      deriv = Derivative.find_by(source_code: code, derivation: @post)

      unless deriv.present?
        source_post = Post.find_by_code code
        d = Derivative.create(source_code: code, derivation: @post, source: source_post)
        if d.errors.any?
          @post.errors.add :base, :invalid, message: "Error sourcing from #{ code }: #{ d.errors.full_messages.join(", ") }"
        elsif source_post.present? && source_post.user != @post.user
          create_notification(
            "**#{ @post.user.username }** has **made a derivative** of your mode **\"==#{ source_post.title }==\"** titled **\"==#{ @post.title }==\"**",
            post_path(@post.code),
            source_post.user.id,
            :post_derived_from,
            "derivative",
            d.id
          )
        end
      end
    end

    if @post.errors.any?
      return false
    end

    if codes.count > Post::MAX_SOURCES
      flash[:warning] = "More sources were provided than allowed, so only the first #{ Post::MAX_SOURCES } sources were saved."
    end
    return true
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end

  def track_action(event = "Posts Visit", parameters = request.path_parameters)
    parameters["id"] = @post.id if @post.present?

    TrackingJob.perform_async(ahoy, event, parameters)
  end

  def post_activity_params
    { id: @post.id }
  end

  def post_params
    params.require(:post).permit(
      :code, :title, :include_nice_url, :nice_url, :status, :description, :version, :snippet, :ptr, :locale, :controls,
      { categories: [] }, { heroes: [] }, { maps: [] }, :tags,
      :collection_id, :new_collection,
      :revision, :revision_description,
      :min_players, :max_players,
      :email_notification, :email,
      :carousel_video, :image_order, images: [])
  end

  def email_notification_enabled
    post_params[:email_notification].present? && post_params[:email_notification] != "0" && post_params[:email].present?
  end

  def update_email_notifications
    if @post.email_notifications.any? && email_notification_enabled
      @post.email_notifications.last.update(email: post_params[:email])
    elsif @post.email_notifications.any? && !email_notification_enabled
      @post.email_notifications.destroy_all
    elsif email_notification_enabled
      create_email_notification(:will_expire, @post.id, post_params[:email])
    end
  end

  def update_blocks
    return unless params[:block].present?

    params[:block].each do |block|
      @block = Block.find(block[0])

      if @block.present?
        properties = block[1][:properties]

        if properties[:images].present?
          @block.images.attach(properties[:images])
        end

        @block.update(content_id: @post.id, properties: properties)
      end
    end
  end

  def published_from_draft
    return @was_draft && !@post.draft?
  end

  def update_draft
    return if @post.draft?

    @post.created_at = Time.now
    @post.updated_at = Time.now
    @post.last_revision_created_at = Time.now

    @post.save
  end

  def notify_discord(type)
    return unless ENV["DISCORD_NOTIFICATIONS_WEBHOOK_URL"].present?
    return if @post.private?
    return if @post.unlisted?
    return if @post.draft?

    set_post_images

    post = @post
    revision = @revision
    path = post_url(post.code.upcase)
    user_path = user_url(post.user.username)
    image = @ordered_images.present? && @ordered_images.first.present? ? url_for(@ordered_images.first.variant(quality: 95).processed.url) : ""
    avatar = @post.user.profile_image.present? ? url_for(@post.user.profile_image.variant(quality: 95, resize_to_fill: [120, 120]).processed.url) : ""
    content = ActionController::Base.helpers.strip_tags(post.description).truncate(type == "New" ? 500 : 250)

    embed = Discord::Embed.new do
      color "#3fbf74"
      image url: image
      author name: post.user.username, avatar_url: avatar, url: user_path
      title "(#{ type }) #{ post.title }"
      url path
      description content
      add_field name: "Update notes", value: post.revisions.last.description.truncate(500) if revision && post.revisions.last.description.present?
      add_field name: "Code", value: post.code.upcase
      footer text: "Elo Hell Esports", icon_url: "https://elohell.gg/media/img/logos/Elo-Hell-Logo_I-C-Dark.png"
    end

    Discord::Notifier.message(embed)
  end
end
