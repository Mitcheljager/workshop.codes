class CollectionsController < ApplicationController
  def show
    nice_url = params[:nice_url].downcase
    @collection = Collection.find_by_nice_url!(nice_url)
    @posts = @collection.posts.order(created_at: :desc).page params[:page]
  end
end
