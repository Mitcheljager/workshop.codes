class CollectionsController < ApplicationController
  before_action except: [:show] do
    redirect_to login_path unless current_user
  end

  def index
    @collections = current_user.collections.order(created_at: :desc)
  end

  def show
    @collection = Collection.find_by_nice_url!(params[:nice_url].downcase)
    @posts = @collection.posts.visible?.order(created_at: :desc).page params[:page]
  end

  def edit
    @collection = Collection.where(user_id: current_user.id).find_by_nice_url!(params[:nice_url].downcase)
  end

  def update
    @collection = Collection.where(user_id: current_user.id).find_by_nice_url!(params[:nice_url].downcase)

    if @collection.update(collection_params)
      redirect_to collections_path
    else
      render file: "app/views/application/error.js.erb"
    end
  end

  def destroy
    @collection = Collection.where(user_id: current_user.id).find_by_nice_url!(params[:nice_url].downcase)

    if @collection.posts.none? && @collection.destroy
      redirect_to collections_path
    else
      render file: "app/views/application/error.js.erb"
    end
  end

  private

  def collection_params
    params.require(:collection).permit(:title)
  end
end
