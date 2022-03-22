class SessionsController < ApplicationController
  include ActivitiesHelper
  include UsersHelper
  include SessionsHelper

  before_action only: [:new] do
    redirect_to root_path if current_user
  end

  after_action :set_return_path, only: [:new]

  def new
  end

  def create
    if current_user && auth_hash.present?
      # User is linking their account to an OAuth provider
      link_user
      return
    elsif auth_hash.present?
      # User is logging in in with OAuth
      @user = User.find_or_create_from_auth_hash(auth_hash)
    else
      # User is logging in without OAuth
      @user = User.find_by_username(params[:username])
    end

    if (@user && @user.provider.nil? && @user.authenticate(params[:password])) || (auth_hash.present? && @user)
      @user = User.find(@user.linked_id) unless @user.linked_id.nil?

      reject_banned_user and return if is_banned?(@user)

      generate_remember_token if (params[:remember_me].present? && params[:remember_me] != "0") || (@user.provider.present?)
      session[:user_id] = @user.id

      create_activity(:login, @user.id)
      ahoy.authenticate(@user)

      redirect_to(session[:return_to] || root_path, fallback_location: root_path)
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
    cookies.delete :remember_token

    reset_session
    redirect_to login_path
  end

  private

  def generate_remember_token
    token = SecureRandom.base64
    RememberToken.create(user_id: @user.id, token: token)

    cookies.encrypted[:remember_token] = { value: token, expires: 30.days }
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

  def link_user
    if User.find_by(uid: auth_hash["uid"])
      # User succesfully logged in with OAuth but an account with their uid already exists

      @user = User.find_or_create_from_auth_hash(auth_hash) # We still run this to update the OAuth user

      if @user.linked_id.present?
        if @user.linked_id == current_user.id
          flash[:alert] = { class: "orange", message: "This log in is already linked to your account." }
        else
          flash[:alert] = { class: "orange", message: "This log in is already linked to a different account." }
        end
      elsif @user == current_user
        flash[:alert] = { class: "orange", message: "You're already logged in using this log in." }
      else
        flash[:alert] = { class: "red", message: "An account is already created for this log in. If you wish to link the account instead please delete the original account." }
      end
    else
      @user = User.find_or_create_from_auth_hash(auth_hash)
      unless @user.present?
        # TODO: Make this explain what went wrong
        flash[:alert] = { class: "red", message: "Something went wrong when linking your account." }
      else
        @user.update(linked_id: current_user.id)

        flash[:alert] = { message: "Your #{provider_nice_name(@user.provider)} account '#{@user.username}' has been linked." }
      end
    end

    redirect_to linked_users_path
  end
end
