class SessionsController < ApplicationController
  include ActivitiesHelper

  before_action only: [:new, :create] do
    redirect_to root_path if current_user
  end

  def new
  end

  def create
    @user = User.find_by_username(params[:username])

    puts "aaaaaaaaaa"

    if @user && @user.authenticate(params[:password])
      puts "bbbbbbbbbbb"
      generate_remember_token if params[:remember_me].present? && params[:remember_me] == "1"
      session[:user_id] = @user.id

      create_activity(:login, { ip_address: last_4_digits_of_request_ip })

      puts @user.id

      redirect_to root_path
    else
      flash[:alert] = "Username or password is invalid"

      create_activity(:login_failed, { ip_address: last_4_digits_of_request_ip }, @user.id) if @user

      redirect_to login_path
    end
  end

  def destroy
    session[:user_id] = nil
    cookies.delete :remember_token

    redirect_to login_path
  end

  private

  def generate_remember_token
    token = SecureRandom.base64
    RememberToken.create(user_id: @user.id, token: token)
    cookies.encrypted.permanent[:remember_token] = token
  end
end
