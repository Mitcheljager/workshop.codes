module Current
  thread_mattr_accessor :user
end

class ApplicationController < ActionController::Base
  include ApplicationHelper
  include ActivitiesHelper
  include UsersHelper
  include ContentHelper

  protect_from_forgery with: :exception
  before_action :set_locale
  before_action :login_from_cookie
  before_action :reject_if_banned
  before_action :redirect_non_www, if: -> { Rails.env.production? }
  before_action :redirect_default_locale
  around_action :set_current_user
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_failed_authenticity_token

  def login_from_cookie
    return unless cookies[:remember_token] && !current_user
    token = RememberToken.find_by_token(cookies.encrypted[:remember_token])

    if token && token.user
      session[:user_id] = token.user.id
      create_activity(:login_from_cookie)
    end
  end

  def reject_if_banned
    reset_session if current_user.present? && current_user.level == "banned"
  end

  helper_method :current_user

  def current_user
    if session[:user_id]
      @current_user ||= User.find(session[:user_id])
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

  helper_method :search_terms

  def search_terms
    @search_terms = Statistic.where(content_type: :search).order(value: :desc).limit(18)
  end

  def active_storage_blob_variant_url
    image = ActiveStorage::Blob.find_by_key(params[:key])

    if image.present?
      if params[:type] == "thumbnail"
        url = ENV["CDN"] + image.variant(quality: 95, resize_to_fill: [120, 120]).processed.key
      else
        url = ENV["CDN"] + image.variant(quality: 95, resize_to_limit: [1920, 1080]).processed.key
      end

      render json: url, layout: false
    else
      render json: "Something went wrong", status: "500", layout: false
    end
  end

  helper_method :set_request_headers

  def set_request_headers
    headers["Access-Control-Allow-Origin"] = "*"
  end

  private

  def redirect_non_www
    if /^www/.match(request.host)
      redirect_to("#{ request.url }".gsub("www.", ""), status: 301)
    end
  end

  def redirect_default_locale
    if params[:locale] == "en"
      redirect_to(request.original_url.gsub("/en", ""), status: 301)
    end
  end

  def set_locale
    locale = params[:locale].to_s.strip.to_sym
    I18n.locale = I18n.available_locales.include?(locale) ? locale : I18n.default_locale
  end

  def default_url_options
    { locale: ((I18n.locale == I18n.default_locale) ? nil : I18n.locale) }
  end

  def handle_failed_authenticity_token
    @message = "Authentication failed. Please refresh the page and try again."
    render "application/error"
  end
end
