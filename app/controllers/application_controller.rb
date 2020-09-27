module Current
  thread_mattr_accessor :user
end

class ApplicationController < ActionController::Base
  include ApplicationHelper
  include ActivitiesHelper
  include UsersHelper
  include ContentHelper

  protect_from_forgery with: :exception
  before_action :login_from_cookie
  before_action :reject_if_banned
  before_action :redirect_non_www, if: -> { Rails.env.production? }
  around_action :set_current_user
  before_action :set_affiliate_ad
  after_action :track_listing

  def login_from_cookie
    return unless cookies[:remember_token] && !current_user
    token = RememberToken.find_by_token(cookies[:remember_token])

    if token
      user = token.user

      if user
        session[:user_id] = user.id
        create_activity(:login_from_cookie)
      end
    end
  end

  def reject_if_banned
    reset_session if current_user.present? && current_user.level == "banned"
  end

  def set_affiliate_ad
    $ad_id = -1
  end

  helper_method :current_user

  def current_user
    if session[:user_id]
      @current_user ||= User.includes(:favorites, :notifications, :remember_tokens).find(session[:user_id])
    else
      @current_user = nil
    end
  end

  def set_current_user
    Current.user = current_user
    yield
  ensure
    Current.user = nil
  end

  helper_method :unread_notifications

  def unread_notifications
    @notifications = current_user.notifications.where(has_been_read: 0)
  end

  helper_method :search_terms

  def search_terms
    @search_terms = Statistic.where(content_type: :search).order(value: :desc).limit(18)
  end

  def track_listing
    if @hot_posts.present?
      @posts = @posts + @hot_posts
    end

    parameters = request.path_parameters

    ListingTrackingJob.perform_async(ahoy, @posts, parameters) if @posts.present?
  end

  private

  def redirect_non_www
    if /^www/.match(request.host)
      redirect_to("#{ request.url }".gsub("www.", ""), status: 301)
    end
  end
end
