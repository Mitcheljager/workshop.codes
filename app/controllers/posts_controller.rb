class PostsController < ApplicationController
  before_action :set_post, only: [:show, :edit, :update, :destroy]

  before_action only: [:edit, :update, :destroy] do
    redirect_to root_path unless current_user && current_user == @post.user
  end

  before_action only: [:create, :new] do
    redirect_to root_path unless current_user
  end

  def index
    @hot_posts = Post.where("favorites_count > 0").order(favorites_count: :desc).limit(3)
    @posts = Post.order(updated_at: :desc).page params[:page]
  end

  def search
    query = params[:search].downcase

    if ActiveRecord::Base.connection.instance_values["config"][:adapter] == "sqlite3"
      @posts = Post.where("title LIKE :search OR categories LIKE :search OR tags LIKE :search OR maps LIKE :search OR heroes LIKE :search", search: "%#{ query }%")
    else
      @posts = Post.where("title ILIKE :search OR categories ILIKE :search OR tags ILIKE :search OR maps ILIKE :search OR heroes ILIKE :search", search: "%#{ query }%")
    end

    @posts.sort { |x, y| (x =~ query) <=> (y =~ query) }
    @posts = @posts.page params[:page]
  end

  def category
    @posts = Post.order(updated_at: :desc).select { |post| to_slug(post.categories).include?(to_slug(params[:category])) }
    @posts = Kaminari.paginate_array(@posts).page(params[:page])
  end

  def hero
    @posts = Post.order(updated_at: :desc).select { |post| to_slug(post.heroes).include?(to_slug(params[:hero])) }
    @posts = Kaminari.paginate_array(@posts).page(params[:page])
  end

  def map
    @posts = Post.order(updated_at: :desc).select { |post| to_slug(post.maps).include?(to_slug(params[:map])) }
    @posts = Kaminari.paginate_array(@posts).page(params[:page])
  end

  def on_fire
    @posts = Post.where("favorites_count > 0").order(favorites_count: :desc).page params[:page]
  end

  def show
  end

  def new
    @post = Post.new
  end

  def edit
  end

  def create
    @post = Post.new(post_params)
    @post.user_id = current_user.id

    if @post.save
      redirect_to post_path(@post.code)
    else
      render :new
    end
  end

  def update
    if @post.update(post_params)
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

  def post_params
    params.require(:post).permit(:code, :title, :description, :version, { categories: [] }, :tags, { heroes: [] }, { maps: [] })
  end
end
