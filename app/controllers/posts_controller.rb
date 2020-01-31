class PostsController < ApplicationController
  include EmailNotificationsHelper

  before_action :set_post, only: [:show, :edit, :update, :destroy]
  skip_before_action :track_ahoy_visit, only: [:create, :update, :destroy]

  before_action only: [:edit, :update, :destroy] do
    redirect_to root_path unless current_user && current_user == @post.user
  end

  before_action :set_order, only: [:category, :hero, :map]

  before_action only: [:create, :new] do
    redirect_to root_path unless current_user
  end

  after_action :track_action, only: [:show, :index, :filter, :on_fire]

  def index
    @hot_posts = Post.where("hotness > 0").order("hotness DESC").limit(3)
    @posts = Post.order(created_at: :desc).page params[:page]
  end

  def filter
    @posts = params[:search] ? Post.search(params[:search]).records : Post.all

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
    @posts = Post.where("hotness > 1").order("hotness DESC").page params[:page]
  end

  def show
    unless @post.present?
      revision = Revision.find_by_code(params[:code])
      @post = revision.post if revision
      redirect_to post_path(revision.post.code) if revision
    end

    not_found and return unless @post.present?
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

      redirect_to post_path(@post.code)
    else
      render :new
    end
  end

  def update
    if @post.update(post_params)
      create_activity(:update_post, post_activity_params)

      update_email_notifications

      if (post_params[:revision].present? && post_params[:revision] != "0") || (params[:code] != post_params[:code])
        invisible = (post_params[:revision].present? && post_params[:revision] == "0") ? 0 : 1
        @revision = Revision.new(post_id: @post.id, code: @post.code, version: @post.version, description: post_params[:revision_description], visible: invisible).save

        create_activity(:update_post, post_activity_params)

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

  private

  def set_post
    @post = Post.find_by_code(params[:code])

    @image_ids = @post.image_order || "[]"
    @ordered_images = JSON.parse(@image_ids).collect {|i| @post.images.find_by_blob_id(i) }
  end

  def set_order
    @order = params[:sort] ? "hotness DESC" : "updated_at DESC"
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end

  def track_action
    parameters = request.path_parameters
    parameters["id"] = @post.id if @post
    ahoy.track "Posts Visit", request.path_parameters
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
