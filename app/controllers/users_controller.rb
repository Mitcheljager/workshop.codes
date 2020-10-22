class UsersController < ApplicationController
  before_action except: [:new, :create] do
    redirect_to login_path unless current_user
  end

  before_action only: [:new] do
    redirect_to account_path if current_user
  end

  skip_after_action :track_listing

  def index
    @users = User.all.order(created_at: :asc)
  end

  def show
    @posts = current_user.posts
    @statistics_for_user = Statistic.where.not(content_type: :listing).where(model_id: @posts.pluck(:id))
    @copies_received = @statistics_for_user.where(content_type: :copy).order(created_at: :asc)
    @views_received = @statistics_for_user.where(content_type: :visit).order(created_at: :asc)
    @listings_received = @statistics_for_user.where(content_type: :listing).order(created_at: :asc)
  end

  def listings
    @posts = current_user.posts
    @recent_listings = Ahoy::Event.where("time > ?", 60.minutes.ago).where(name: "Listing").pluck(:properties).select { |l| @posts.pluck(:id).include?(l["id"]) }

    render partial: "listings"
  end

  def new
    @user = User.new
  end

  def edit
    @user = current_user
    redirect_to root_path unless @user
  end

  def create
    @user = User.new(user_params)

    if @user.save
      session[:user_id] = @user.id
      generate_remember_token if params[:remember_me]

      create_activity(:create_user, @user.id)

      if params[:elohell].present?
        redirect_to new_post_path(elohell: params[:elohell])
      else
        redirect_to account_path
      end
    else
      render :new
    end
  end

  def update
    params[:user].delete(:password).delete(:password_confirmation) if params[:user][:password].blank? && params[:user][:password].present?

    @user = current_user
    if @user.update(user_params)
      flash[:alert] = "Successfully saved"
      create_activity(:update_user)
      redirect_to edit_user_path
    else
      render :edit
    end
  end

  def destroy
    current_user.destroy

    session[:user_id] = nil
    redirect_to login_path
  end

  def favorites
    @favorites = current_user.favorites.order(created_at: :desc).page(params[:page])
  end

  def posts
    @posts = current_user.posts.order("#{ allowed_sort_params.include?(params[:sort_posts]) ? params[:sort_posts] : "created_at" } DESC").page(params[:page])
  end

  def accessibility; end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation, :email)
  end

  def generate_remember_token
    token = SecureRandom.base64
    RememberToken.create(user_id: @user.id, token: token)
  end

  def allowed_sort_params
    %w[updated_at created_at hotness favorites_count]
  end
end
