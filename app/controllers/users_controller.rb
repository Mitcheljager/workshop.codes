class UsersController < ApplicationController
  before_action only: [:show, :edit, :update, :destroy, :favorites, :posts] do
    redirect_to login_path unless current_user
  end

  before_action only: [:new] do
    redirect_to account_path if current_user
  end

  def index
    @users = User.all.order(created_at: :asc)
  end

  def show
    @posts = current_user.posts
    @favorites_received = Favorite.where(post_id: @posts.pluck(:id)).order(created_at: :asc)
    @copies_received = Statistic.where(model_id: @posts.pluck(:id)).where(content_type: :copy).order(created_at: :asc)
    @views_received = Statistic.where(model_id: @posts.pluck(:id)).where(content_type: :visit).order(created_at: :asc)
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

      create_activity(:create_user, { ip_address: last_4_digits_of_request_ip })

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
      create_activity(:update_user, { ip_address: last_4_digits_of_request_ip })
      redirect_back fallback_location: account_path
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
    @posts = current_user.posts.order(updated_at: :desc).page(params[:page])
  end

  def accessibility; end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation, :email, :high_contrast, :large_fonts, :simple_view)
  end

  def generate_remember_token
    token = SecureRandom.base64
    RememberToken.create(user_id: @user.id, token: token)
  end
end
