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
      @user = User.where(verified: true).find_by("upper(nice_url) = ?", params[:username].upcase)
    end

    not_found unless @user.present?

    @posts = @user.posts.where(private: 0).order("#{ allowed_sort_params.include?(params[:sort_posts]) ? params[:sort_posts] : "created_at" } DESC").page(params[:page])
    @featured_posts = @user.posts.where(id: @user.featured_posts)
  end

  def edit
    @user = current_user
    redirect_to root_path unless @user
  end

  def update
    @user = current_user

    if profile_params[:featured_posts] == nil
      @user.featured_posts = ""
    end

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

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end

  def allowed_sort_params
    %w[updated_at created_at hotness favorites_count]
  end
end
