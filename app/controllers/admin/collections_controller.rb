class Admin::CollectionsController < Admin::BaseController
  def index
    @collections = Collection.order("created_at DESC").page(params[:page])
  end

  def show
    @collection = Collection.find(params[:id])
  end

  def find
    @collection = Collection.find_by_title!(params[:title])
    redirect_to admin_collection_path(@collection.id)
  end
end
