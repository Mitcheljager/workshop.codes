class SessionsController < ApplicationController
  include ActivitiesHelper

  before_action only: [:new, :create] do
    redirect_to root_path if current_user
  end

  def new
  end

  def create
    if auth_hash.present?
      @user = User.find_or_create_from_auth_hash(auth_hash)
    else
      @user = User.find_by_username(params[:username])
    end

    if (@user && @user.provider.nil? && @user.authenticate(params[:password])) || (auth_hash.present? && @user)
      generate_remember_token if params[:remember_me].present? && params[:remember_me] != "0"
      session[:user_id] = @user.id

      create_activity(:login, { ip_address: last_4_digits_of_request_ip })

      redirect_to account_path
    else
      if auth_hash.present?
        flash[:alert] = "Log in failed. An account with the same Username might already exist."
      else
        flash[:alert] = "Username or password is invalid"
      end

      create_activity(:login_failed, { ip_address: last_4_digits_of_request_ip }, @user.id) if @user

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

  def auth_hash
    request.env["omniauth.auth"]
  end
end
