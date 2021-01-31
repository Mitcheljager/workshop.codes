class FavoritesController < ApplicationController
  def create
    @favorite = Favorite.new(favorite_params)
    @favorite.user_id = current_user.id

    @post = Post.find(favorite_params[:post_id])

    respond_to do |format|
      if @favorite.save
        BadgesFavoritesJob.perform_async(@post, current_user)

        format.js
        format.html { redirect_to root_path }
      else
        format.js { render "application/error" }
      end
    end
  end

  def destroy
    @favorite = Favorite.find_by_post_id_and_user_id(favorite_params[:post_id], current_user.id)

    @post = Post.find(favorite_params[:post_id])

    respond_to do |format|
      if @favorite.destroy
        format.js { render "application/error" }
      else
        format.js
        format.html { redirect_to root_path }
      end
    end
  end

  private

  def favorite_params
    params.require(:favorite).permit(:post_id)
  end
end
