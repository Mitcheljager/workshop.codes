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
    # Handle a request to store only authorization without database-backed user
    if should_authorize_only
      set_session_auth
      flash[:notice] = "You are now authenticated as #{auth_hash["info"]["name"] || auth_hash["info"]["battletag"]} for the next 30 minutes."
      path = omniauth_params["redirect_path"].presence || ""
      redirect_to_path path
      return
    else
      clean_up_session_auth
    end

    if current_user && auth_hash.present?
      # User is linking their account to an OAuth provider
      link_user
      return
    end

    if auth_hash.present?
      # User is logging in in with OAuth
      @user = User.find_or_create_from_auth_hash(auth_hash)
    else
      # User is logging in without OAuth
      @user = User.find_by_username(params[:username])
    end

    if (@user && @user.provider.nil? && @user.authenticate(params[:password])) || (auth_hash.present? && @user)
      @user = User.find(@user.linked_id) unless @user.linked_id.nil?

      reject_banned_user and return if is_banned?(@user)

      return_path = session[:return_to]
      reset_session
      generate_remember_token if (params[:remember_me].present? && params[:remember_me] != "0") || (@user.provider.present?)
      session[:user_id] = @user.id
      session[:user_uuid] = @user.uuid
      session[:return_to] = return_path

      create_activity(:login, @user.id)
      ahoy.authenticate(@user)

      if omniauth_params.respond_to?(:[]) && omniauth_params["redirect_path"].present?
        path = omniauth_params["redirect_path"].presence || ""
        redirect_to_path path
        return
      end

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

  def omniauth_params
    request.env["omniauth.params"]
  end

  def set_return_path
    return if !request.referrer.present?

    referrer_domain = URI(request.referrer).host
    current_domain = request.host

    if referrer_domain == current_domain
      session[:return_to] = request.referrer
    end
  end

  def redirect_to_path(path)
    unless path.starts_with? "/"
      path = "/" + path
    end
    redirect_to(request.base_url + path)
  end

  def link_user
    if User.find_by(uid: auth_hash["uid"])
      # User succesfully logged in with OAuth but an account with their uid already exists

      @user = User.find_or_create_from_auth_hash(auth_hash) # We still run this to update the OAuth user

      unless @user.present? # Problem creating account to link
        flash[:error] = "Something went wrong when syncing your account details, and the link could not be completed."
      else
        flash_for_existing_account
      end
    else
      @user = User.find_or_create_from_auth_hash(auth_hash)
      unless @user.present?
        flash[:alert] = "Something went wrong when linking your account."
      else
        @user.update(linked_id: current_user.id)

        flash[:alert] = "Your #{provider_nice_name(@user.provider)} account '#{@user.username}' has been linked."
      end
    end

    redirect_to linked_users_path
  end

  def flash_for_existing_account
    if @user.linked_id.present? # Already linked somewhere
      if @user.linked_id == current_user.id
        flash[:warning] = "This login is already linked to your account."
        return
      else
        flash[:warning] = "This login is already linked to a different account."
        return
      end
    end

    if @user == current_user # User is trying to link their own account
      flash[:warning] = "You're already logged in using this login."
      return
    end

    # If this account already exists, and isn't linked, we can't link it to the current user
    flash[:warning] = "An account is already created for this login. If you wish to link the account instead please delete the original account."
  end

  def should_authorize_only
    omniauth_params.respond_to?(:[]) &&
      omniauth_params["auth_only_no_user"].present? &&
      auth_hash.present?
  end

  def set_session_auth
    session["oauth_provider"] = auth_hash["provider"]
    session["oauth_uid"] = auth_hash["uid"]
    session["oauth_expires_at"] = Time.now + 30.minutes
  end
end
