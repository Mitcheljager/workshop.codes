class Admin::FavoritesController < Admin::BaseController
  def index
    @favorites = Favorite.order(created_at: :desc).page(params[:page])
  end
end
