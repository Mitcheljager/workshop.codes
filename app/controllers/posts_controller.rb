class PostsController < ApplicationController
  before_action :set_post, only: [:show, :edit, :update, :destroy]

  before_action only: [:edit, :update, :destroy] do
    redirect_to root_path unless current_user && current_user == @post.user
  end

  before_action :set_order, only: [:category, :hero, :map]

  before_action only: [:create, :new] do
    redirect_to root_path unless current_user
  end

  def index
    @hot_posts = Post.where("hotness > 0").order("hotness DESC").limit(3)
    @posts = Post.order(created_at: :desc).page params[:page]
  end

  def search
    @posts = Post.search(params[:search]).records.page params[:page]
  end

  def category
    @posts = Post.order(@order).select { |post| to_slug(post.categories).include?(to_slug(params[:category])) }
    @posts = Kaminari.paginate_array(@posts).page(params[:page])
  end

  def hero
    @posts = Post.order(@order).select { |post| to_slug(post.heroes).include?(to_slug(params[:hero])) }
    @posts = Kaminari.paginate_array(@posts).page(params[:page])
  end

  def map
    @posts = Post.order(@order).select { |post| to_slug(post.maps).include?(to_slug(params[:map])) }
    @posts = Kaminari.paginate_array(@posts).page(params[:page])
  end

  def on_fire
    @posts = Post.where("hotness > 0").order("hotness DESC").page params[:page]
  end

  def show
    revision = Revision.find_by_code(params[:code])
    @post = revision.post if revision

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
      redirect_to post_path(@post.code)
    else
      render :new
    end
  end

  def update
    if @post.update(post_params)
      if post_params[:revision].present? && post_params[:revision] != "0"
        @revision = Revision.new(post_id: @post.id, code: @post.code, version: @post.version, description: post_params[:revision_description]).save
      end

      redirect_to post_path(@post.code)
    else
      render :edit
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_url
  end

  private

  def set_post
    @post = Post.find_by_code(params[:code])
  end

  def set_order
    @order = params[:sort] ? "hotness DESC" : "updated_at DESC"
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end

  def track_action
    current_visit_event = Ahoy::Event.where(name: "Post Visit").where(visit_id: current_visit.id, properties: { post_id: @post.id })

    unless current_visit_event.any?
      ahoy.track "Post Visit", post_id: @post.id
      @post.increment!(:impressions_count)
    end
  end

  def post_params
    params.require(:post).permit(:code, :title, :description, :version, { categories: [] }, :tags, { heroes: [] }, { maps: [] }, :revision, :revision_description, :snippet)
  end
end
