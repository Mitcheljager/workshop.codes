class SessionsController < ApplicationController
  include ActivitiesHelper
  include UsersHelper

  before_action only: [:new, :create] do
    redirect_to root_path if current_user
  end

  after_action :set_return_path, only: [:new]

  def new
  end

  def create
    if auth_hash.present?
      @user = User.find_or_create_from_auth_hash(auth_hash)
      params[:elohell] = request.env["omniauth.params"]["elohell"] if request.env["omniauth.params"]["elohell"].present?
    else
      @user = User.find_by_username(params[:username])
    end

    if (@user && @user.provider.nil? && @user.authenticate(params[:password])) || (auth_hash.present? && @user)
      reject_banned_user and return if is_banned?(@user)

      generate_remember_token if params[:remember_me].present? && params[:remember_me] != "0"
      session[:user_id] = @user.id

      create_activity(:login, @user.id)

      if params[:elohell].present?
        redirect_to new_post_path(elohell: params[:elohell])
      else
        redirect_to(session[:return_to] || root_path, fallback_location: root_path)
      end
    else
      if auth_hash.present?
        flash[:alert] = "Log in failed. An account with the same Username might already exist."
      else
        flash[:alert] = "Username or password is invalid"
      end

      redirect_to login_path
    end
  end

  def destroy
    current_user.remember_tokens.destroy_all if current_user && current_user.remember_tokens.any?

    reset_session
    redirect_to login_path
  end

  private

  def generate_remember_token
    token = SecureRandom.base64
    RememberToken.create(user_id: @user.id, token: token)
  end

  def reject_banned_user
    flash[:alert] = "Your account has been banned"
    redirect_to login_path
  end

  def auth_hash
    request.env["omniauth.auth"]
  end

  def set_return_path
    session[:return_to] = request.referrer
  end
end
