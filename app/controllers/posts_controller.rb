class PostsController < ApplicationController
  include EmailNotificationsHelper

  before_action :set_post, only: [:edit, :update, :destroy]
  before_action :set_post_images, only: [:edit]
  skip_before_action :track_ahoy_visit

  before_action only: [:edit, :update, :destroy] do
    redirect_to root_path unless current_user && current_user == @post.user
  end

  before_action :set_order, only: [:category, :hero, :map]

  before_action only: [:create, :new] do
    redirect_to root_path unless current_user
  end

  after_action :track_action, only: [:show, :index, :filter, :on_fire]

  def index
    @hot_posts = Post.includes(:user, :revisions).where("hotness > 0").order("hotness DESC").limit(3)
    @posts = Post.includes(:user, :revisions).order(created_at: :desc).page params[:page]
  end

  def filter
    @posts = params[:search] ? Post.includes(:user, :revisions).search(params[:search]).records : Post.all

    @posts = @posts.where("created_at >= ?", params[:from]) if params[:from]
    @posts = @posts.where("created_at <= ?", params[:to]) if params[:to]
    @posts = @posts.where("updated_at > ?", 6.months.ago) if params[:expired]

    @posts = @posts.order("#{ sort_switch } DESC") if params[:sort] && params[:sort] != "relevancy"

    @posts = @posts.select { |post| to_slug(post.categories).include?(to_slug(params[:category])) } if params[:category]
    @posts = @posts.select { |post| to_slug(post.maps).include?(to_slug(params[:map])) } if params[:map]
    @posts = @posts.select { |post| to_slug(post.heroes).include?(to_slug(params[:hero])) } if params[:hero]

    @posts = Kaminari.paginate_array(@posts).page(params[:page])
  end

  def on_fire
    @posts = Post.includes(:user, :revisions).where("hotness > 1").order("hotness DESC").page params[:page]

    fresh_when last_modified: @posts.maximum(:updated_at) unless current_user
  end

  def show
    @post = Rails.cache.fetch(["Post", params[:code].upcase]) do
      Post.includes(:user, :revisions, :comments).find_by("upper(code) = ?", params[:code].upcase)
    end

    set_post_images

    unless @post.present?
      revision = Revision.find_by_code(params[:code])
      @post = revision.post if revision
      redirect_to post_path(revision.post.code) if revision
    end

    not_found and return unless @post.present?

    respond_to do |format|
      format.html
      format.json { render json: @post, except: [:id, :user_id, :image_order, :favorites_count, :impressions_count, :hotness] }
    end
  end

  def new
    @post = Post.new
  end

  def edit
  end

  def parse_markdown
    parsed_markdown = markdown(post_params[:description].html_safe)

    render json: parsed_markdown, layout: false
  end

  def create
    @post = Post.new(post_params)
    @post.user_id = current_user.id

    if @post.save
      @revision = Revision.new(post_id: @post.id, code: @post.code, version: @post.version).save

      create_activity(:create_post, post_activity_params)
      create_email_notification(:will_expire, @post.id, post_params[:email]) if email_notification_enabled
      Rails.cache.write(["Post", @post.code.upcase], @post.includes(:user, :revisions, :comments))

      redirect_to post_path(@post.code)
    else
      render :new
    end
  end

  def update
    if @post.update(post_params)
      create_activity(:update_post, post_activity_params)
      Rails.cache.write(["Post", params[:code].upcase], @post.includes(:user, :revisions, :comments))

      update_email_notifications

      if (post_params[:revision].present? && post_params[:revision] != "0") || (params[:code] != post_params[:code])
        invisible = (post_params[:revision].present? && post_params[:revision] == "0") ? 0 : 1
        @revision = Revision.new(post_id: @post.id, code: @post.code, version: @post.version, description: post_params[:revision_description], visible: invisible).save

        redirect_to post_path(@post.code)
      else
        redirect_to post_path(@post.code)
      end
    else
      render :edit
    end
  end

  def destroy
    @post.destroy
    create_activity(:destroy_post, post_activity_params)

    redirect_to posts_url
  end

  def copy_code
    @post = Post.find_by_code(post_params[:code])
    @post = Revision.find_by_code(post_params[:code]).post unless @post.present?

    track_action("Copy Code")
  end

  private

  def set_post
    @post = Post.find_by_code(params[:code])
  end

  def set_post_images
    return unless @post.present? && @post.images.any?

    @image_ids = @post.image_order || "[]"
    @ordered_images = JSON.parse(@image_ids).collect { |i| @post.images.find_by_blob_id(i) }
  end

  def set_order
    @order = params[:sort] ? "hotness DESC" : "updated_at DESC"
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end

  def track_action(event = "Posts Visit")
    parameters = request.path_parameters
    parameters["id"] = @post.id if @post.present?


    TrackingJob.perform_async(ahoy, event, parameters)
  end

  def sort_switch
    case params[:sort]
    when "views"
      "impressions_count"
    when "favorites"
      "favorites_count"
    when "time"
      "created_at"
    when "on-fire"
      "hotness"
    else
      "created_at"
    end
  end

  def post_activity_params
    { ip_address: last_4_digits_of_request_ip, id: @post.id }
  end

  def post_params
    params.require(:post).permit(
      :code, :title, :description, :version, { categories: [] }, :tags, { heroes: [] }, { maps: [] }, :snippet,
      :revision, :revision_description,
      :email_notification, :email,
      :image_order, images: [])
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
end
