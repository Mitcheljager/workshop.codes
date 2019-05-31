class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :login_from_cookie

  def login_from_cookie
    return unless cookies.encrypted[:remember_token] && !current_user
    token = RememberToken.find_by_token(cookies.encrypted[:remember_token])

    if token
      user = token.user

      if user
        session[:user_id] = user.id
      end
    end
  end

  helper_method :current_user

  def current_user
    if session[:user_id]
      @current_user ||= User.find(session[:user_id])
    else
      @current_user = nil
    end
  end
end
