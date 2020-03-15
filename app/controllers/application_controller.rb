class ApplicationController < ActionController::Base
  include ApplicationHelper
  include ActivitiesHelper

  protect_from_forgery with: :exception
  before_action :login_from_cookie
  before_action :redirect_non_www, if: -> { Rails.env.production? }

  def login_from_cookie
    return unless cookies[:remember_token] && !current_user
    token = RememberToken.find_by_token(cookies[:remember_token])

    if token
      user = token.user

      if user
        session[:user_id] = user.id
        create_activity(:login_from_cookie, { ip_address: last_4_digits_of_request_ip })
      end
    end
  end

  helper_method :current_user

  def current_user
    if session[:user_id]
      @current_user ||= User.includes(:favorites, :notifications, :remember_tokens).find(session[:user_id])
    else
      @current_user = nil
    end
  end

  helper_method :unread_notifications

  def unread_notifications
    @notifications = current_user.notifications.where(has_been_read: 0)
  end

  private

  def redirect_non_www
    if /^www/.match(request.host)
      redirect_to("#{ request.url }".gsub("www.", ""), status: 301)
    end
  end
end
