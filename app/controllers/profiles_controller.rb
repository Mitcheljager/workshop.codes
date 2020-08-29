class ProfilesController < ApplicationController
  before_action only: [:edit, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  def show
    @user = User.find_by("upper(username) = ?", params[:username].upcase)

    if @user.present?
      if @user.verified? && @user.nice_url.present? && @user.nice_url != @user.username
        redirect_to profile_show_path(@user.nice_url)
      end
    else
      @user = User.where(verified: true).find_by_nice_url(params[:username].downcase)
    end

    @posts = @user.posts.where(private: 0).order(updated_at: :desc).page(params[:page])
    @featured_posts = @user.posts.where(id: @user.featured_posts)
  end

  def edit
    @user = current_user
    redirect_to root_path unless @user
  end

  def update
    @user = current_user

    if @user.update(profile_params)
      flash[:alert] = "Successfully saved"
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
