class FavoritesController < ApplicationController
  def create
    @favorite = Favorite.new(favorite_params)
    @favorite.user_id = current_user.id

    @post = Post.find(favorite_params[:post_id])

    if @favorite.save
      respond_to do |format|
        format.js
      end
    end
  end

  def destroy
    @favorite = Favorite.find_by_post_id_and_user_id(favorite_params[:post_id], current_user.id)

    @post = Post.find(favorite_params[:post_id])

    if @favorite.destroy
      respond_to do |format|
        format.js
      end
    end
  end

  private

  def favorite_params
    params.require(:favorite).permit(:post_id)
  end
end
