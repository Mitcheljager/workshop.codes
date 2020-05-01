class ProfilesController < ApplicationController
  before_action only: [:edit, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  def show
    @user = User.find_by_username!(params[:username])
    @posts = @user.posts.where(private: 0).order(updated_at: :desc).page(params[:page])
  end

  def edit
    @user = current_user
    redirect_to root_path unless @user
  end

  def update
    @user = current_user
    if @user.update(profile_params)
      redirect_to edit_profile_path
    else
      render :edit
    end
  end

  private

  def profile_params
    params.require(:user).permit(:profile_image, :link, :description, { featured_posts: [] })
  end
end
