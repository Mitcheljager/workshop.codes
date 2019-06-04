class UsersController < ApplicationController
  before_action only: [:show, :account, :edit, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  before_action only: [:new] do
    redirect_to account_path if current_user
  end

  def index
    @users = User.all.order(created_at: :asc)
  end

  def show
    @user = User.find_by_username(params[:username])
    @posts = @user.posts.order(updated_at: :desc).page(params[:page]).per(10)
  end

  def account
    @user = current_user
    @posts = @user.posts.order(updated_at: :desc)
    @favorites = @user.favorites.page(params[:page]).per(5).order(created_at: :desc)
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

      redirect_to user_path(@user.username)
    else
      render :new
    end
  end

  def update
    params[:user].delete(:password).delete(:password_confirmation) if params[:user][:password].blank?

    @user = current_user
    if @user.update(user_params)
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

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation)
  end
end
