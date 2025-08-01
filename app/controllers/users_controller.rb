class UsersController < ApplicationController
  before_action :honeypot, only: [:create]

  before_action except: [:new, :create] do
    redirect_to login_path unless current_user
  end

  before_action only: [:new] do
    redirect_to account_path if current_user
  end

  def index
    @users = User.all.order(created_at: :asc)
  end

  def show
    @posts = current_user.posts.select(:id)
    @favorites_count = @posts.pluck(:favorites_count).sum
    @statistics_for_user = Statistic.where(content_type: [:copy, :visit]).where(model_id: @posts.pluck(:id)).select(:content_type, :value)
    @copies_count = @statistics_for_user.where(content_type: :copy).pluck(:value).sum
    @views_count = @statistics_for_user.where(content_type: :visit).pluck(:value).sum
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
      refresh_remember_token_cookie if params[:remember_me]

      create_activity(:create_user, @user.id)

      redirect_to account_path
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
    @posts = Post.where(user_id: current_user.id).select_overview_columns.order("#{ allowed_sort_params.include?(params[:sort_posts]) ? params[:sort_posts] : "created_at" } DESC").page(params[:page])
  end

  def collections
    @collections = current_user.collections.order(created_at: :desc)
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation, :email, :email_confirmation)
  end

  def allowed_sort_params
    %w[updated_at created_at hotness favorites_count]
  end

  def honeypot
    return if user_params[:email_confirmation].blank?

    Bugsnag.notify("User was blocked from creating an account via honeypot") if Rails.env.production?
    redirect_to root_path
  end
end
