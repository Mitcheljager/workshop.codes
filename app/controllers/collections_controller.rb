class CollectionsController < ApplicationController
  before_action except: [:show, :partial] do
    redirect_to login_path unless current_user
  end

  def index
    @collections = Collection.includes(:posts).where("posts_count > ?", 0).order(created_at: :desc).page(params[:page])
  end

  def show
    @collection = Collection.find_by_nice_url!(params[:nice_url].downcase)
    @posts = @collection.posts.visible?.order(created_at: :desc).page params[:page]
    @display_type = @collection.display_type

    respond_to do |format|
      format.html
      format.js { render "posts/infinite_scroll_posts" }
    end
  end

  def partial
    @post = Post.select(:id, :collection_id).includes(:collection).find(params[:id])
    @collection = @post.collection

    render partial: "post_collection_posts"
  end

  def new
    @collection = Collection.new
    @collection.nice_url = SecureRandom.alphanumeric(6).downcase
  end

  def create
    @collection = Collection.new(collection_params)
    @collection.user_id = current_user.id

    if @collection.save
      params[:collection][:collection_posts] = [] if collection_params[:collection_posts].nil?
      set_collection_id_for_posts(collection_params[:collection_posts])

      flash[:notice] = "Collection created"
      redirect_to edit_collection_path(@collection.id)
    else
      render :new
    end
  end

  def edit
    @collection = current_user.collections.find(params[:id])
  end

  def update
    @collection = current_user.collections.find(params[:id])

    initial_ids = @collection.posts.pluck(:id)
    param_ids = (collection_params[:collection_posts] || []).map { |id| id.to_i }

    if @collection.update(collection_params)
      if params[:remove_cover_image].present?
        @collection.cover_image.purge
      end

      if initial_ids != param_ids
        set_collection_id_for_posts(param_ids, initial_ids)
      end

      flash[:alert] = "Successfully saved"
      redirect_to edit_collection_path(@collection.id)
    else
      render :edit
    end
  end

  def destroy
    @collection = Collection.where(user_id: current_user.id).find(params[:id])

    if @collection.posts.none? && @collection.destroy
      redirect_to account_collections_path
    else
      render "application/error"
    end
  end

  def revisions
    @collection = Collection.find_by_nice_url!(params[:nice_url].downcase)
    @post_ids = @collection.posts.visible?.pluck(:id)
    @revisions = Revision.includes(:post).where(visible: true, post_id: @post_ids).order(created_at: :desc).page(params[:page])

    respond_to do |format|
      format.html
      format.js {
        render "feed/infinite_scroll_feed_items"
      }
    end
  end

  private

  def collection_params
    params.require(:collection).permit(:title, :nice_url, :cover_image, :description, :display_type, { collection_posts: [] })
  end

  def set_collection_id_for_posts(current_ids = [], initial_ids = [])
    new_ids = current_ids - initial_ids

    posts = current_user.posts.where(id: new_ids)
    posts.each do |post|
      post.update_column(:collection_id, @collection.id)
      Collection.increment_counter(:posts_count, @collection.id)
    end

    removed_ids = initial_ids - current_ids
    posts = current_user.posts.where(id: removed_ids)
    posts.each do |post|
      post.update_column(:collection_id, nil)
      Collection.decrement_counter(:posts_count, @collection.id)
    end
  end
end
