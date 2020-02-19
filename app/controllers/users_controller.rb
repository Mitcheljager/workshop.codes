class UsersController < ApplicationController
  before_action only: [:account, :edit, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  before_action only: [:new] do
    redirect_to account_path if current_user
  end

  def index
    @users = User.all.order(created_at: :asc)
  end

  def show
    @user = User.find_by_username!(params[:username])
    @posts = @user.posts.order(updated_at: :desc).page(params[:page]).per(10)
  end

  def account
    @posts = current_user.posts
    @favorites_given = Favorite.where(user_id: current_user.id)
    @favorites_received = Favorite.where(post_id: @posts.pluck(:id)).order(created_at: :asc)
    @copies_received = Statistic.where(model_id: @posts.pluck(:id)).where(content_type: :copy).order(created_at: :asc)
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
      redirect_to account_path
    else
      render :new
    end
  end

  def update
    params[:user].delete(:password).delete(:password_confirmation) if params[:user][:password].blank?

    @user = current_user
    if @user.update(user_params)
      create_activity(:update_user, { ip_address: last_4_digits_of_request_ip })
      redirect_to account_path
    else
      render :edit
    end
  end

  def destroy
    current_user.destroy
    current_user.posts.destroy_all
    current_user.favorites.destroy_all

    session[:user_id] = nil
    redirect_to login_path
  end

  def favorites
    @favorites = current_user.favorites.order(created_at: :desc).page(params[:page])
  end

  def posts
    @posts = current_user.posts.order(updated_at: :desc).page(params[:page])
  end

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
    cookies.encrypted.permanent[:remember_token] = token
  end
end
