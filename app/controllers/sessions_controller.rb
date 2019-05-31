class SessionsController < ApplicationController
  before_action only: [:new, :create] do
    redirect_to root_path if current_user
  end

  def new
  end

  def create
    @user = User.find_by_username(params[:username])

    if @user && @user.authenticate(params[:password])
      generate_remember_token if params[:remember_me]
      session[:user_id] = @user.id
      redirect_to account_path
    else
      flash.now[:alert] = "Username or password is invalid"
      render "new"
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
