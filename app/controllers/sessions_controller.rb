class SessionsController < ApplicationController
  include ActivitiesHelper

  before_action only: [:new, :create] do
    redirect_to root_path if current_user
  end

  def new
  end

  def create
    @user = User.find_by_username(params[:username])

    if @user && @user.authenticate(params[:password])
      generate_remember_token if params[:remember_me].present? && params[:remember_me] != "0"
      session[:user_id] = @user.id

      create_activity(:login, { ip_address: last_4_digits_of_request_ip })

      redirect_to root_path
    else
      flash[:alert] = "Username or password is invalid"

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
end
