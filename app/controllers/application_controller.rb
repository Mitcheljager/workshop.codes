class ApplicationController < ActionController::Base
  include RememberTokenHandler
  include CurrentUserHandler
  include ApplicationHelper
  include ActivitiesHelper
  include UsersHelper
  include ContentHelper
  include FilterHelper

  content_security_policy Rails.env.production?

  protect_from_forgery with: :exception

  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_failed_authenticity_token
  rescue_from AbstractController::ActionNotFound, with: :render_404
  rescue_from ActionController::RoutingError, with: :render_404
  rescue_from ActionController::UnknownFormat, with: :render_404
  rescue_from ActionController::BadRequest, with: -> { head :bad_request }

  def active_storage_blob_variant_url
    blob = ActiveStorage::Blob.find_by_key(params[:key])

    if blob.present?
      if params[:type] == "video"
        url = rails_public_blob_url(blob)
      elsif params[:type] == "thumbnail"
        url = rails_public_blob_url(blob.variant(quality: 95, resize_to_fill: [200, 200 / 9 * 5], format: :webp).processed)
      elsif params[:type] == "full"
        url = rails_public_blob_url(blob.variant(quality: 95).processed)
      else
        url = rails_public_blob_url(blob.variant(quality: 95, resize_to_limit: [1920, 1080], format: :webp).processed)
      end

      render json: url, layout: false
    else
      render json: "Something went wrong", status: "500", layout: false
    end
  end

  helper_method :theme

  def theme
    cookies[:theme] || "overwatch"
  end

  helper_method :set_request_headers

  def set_request_headers
    headers["Access-Control-Allow-Origin"] = "*"
    headers["Access-Control-Allow-Methods"] = "GET"
    headers["Access-Control-Allow-Headers"] = "*"
    headers["Content-Security-Policy"] = "default-src 'none'"
  end

  def render_404
    respond_to do |format|
      format.html { render "errors/not_found", status: 404 }
      format.xml { head 404 }
      format.js { head 404 }
      format.json { render json: { error: "Not found" }, status: 404 }
    end
  rescue ActionController::UnknownFormat
    head 404
  end

  def handle_failed_authenticity_token
    @message = "Authentication failed. Please refresh the page and try again."
    render "application/error"
  end
end
