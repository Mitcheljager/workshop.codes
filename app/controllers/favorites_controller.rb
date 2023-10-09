class FavoritesController < ApplicationController
  def create
    @favorite = Favorite.new(favorite_params)
    @favorite.user_id = current_user.id

    @post = Post.find(favorite_params[:post_id])

    respond_to do |format|
      if @post.present? && @favorite.save
        BadgesFavoritesJob.perform_async(@post, current_user)

        format.json { render json: { status: 200 }, status: 200 }
        format.html { redirect_to root_path }
      else
        format.js { render "application/error" }
      end
    end
  end

  def destroy
    @favorite = current_user.favorites.find_by_post_id(favorite_params[:post_id])
    @post = Post.find(favorite_params[:post_id])

    respond_to do |format|
      if @post.present? && @favorite&.destroy
        format.json { render json: { status: 200 }, status: 200 }
        format.html { redirect_to root_path }
      else
        format.js { render "application/error" }
      end
    end
  end

  private

  def favorite_params
    params.require(:favorite).permit(:post_id)
  end
end
