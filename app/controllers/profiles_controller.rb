class ProfilesController < ApplicationController
  before_action only: [:edit, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  def show
    @user = User.includes(:collections).where(linked_id: nil).find_by("upper(username) = ?", params[:username].upcase)

    if @user.present?
      if @user.verified? && @user.nice_url.present? && @user.nice_url != @user.username
        redirect_to profile_path(@user.nice_url)
      end
    else
      @user = User.where(verified: true).find_by("upper(nice_url) = ?", params[:username].upcase)
    end

    not_found unless @user.present?

    @posts = @user.posts.select_overview_columns.public?.order("#{ allowed_sort_params.include?(params[:sort_posts]) ? params[:sort_posts] : "created_at" } DESC").page(params[:page])
    @blocks = Block.where(user_id: @user.id, content_type: :profile).order(position: :asc, created_at: :asc)

    respond_to do |format|
      format.html
      format.js { render "posts/infinite_scroll_posts" }
      format.json {
        set_request_headers
        render json: @posts
      }
    end
  end

  def edit
    @user = current_user
    @blocks = Block.where(user_id: @user.id, content_type: :profile).order(position: :asc, created_at: :asc)

    redirect_to root_path unless @user
  end

  def update
    begin
      @user = current_user
      User.transaction do

        if profile_params[:featured_posts] == nil
          @user.featured_posts = ""
        end

        if (params[:remove_profile_image].present?)
          @user.profile_image.purge
        end
        if (params[:remove_banner_image].present?)
          @user.banner_image.purge
        end

        @user.update!(profile_params)
      end

      flash[:alert] = "Successfully saved"
      respond_to do |format|
        format.html { redirect_to edit_profile_path }
        format.js { render "application/success" }
      end
    rescue ActiveRecord::ActiveRecordError => exception
      flash[:error] = "Something went wrong, and your changes weren't saved"
      respond_to do |format|
        format.html { redirect_to edit_profile_path }
        format.js { render "application/error" }
      end
    end
  end

  private

  def profile_params
    params.require(:user).permit(:profile_image, :banner_image, :link, :description, :custom_css, { featured_posts: [] })
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end

  def allowed_sort_params
    %w[updated_at created_at hotness favorites_count]
  end
end
