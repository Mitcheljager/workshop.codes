class Api::BaseController < ApplicationController
  before_action :set_request_format
  before_action :set_request_headers
  before_action :set_cache_headers

  def index
    render json: { message: "Hey!" }
  end

  private

  def set_request_format
    request.format = :json
  end

  def set_cache_headers
    headers["Cache-Control"] = "public, max-age=#{10.minutes}"
  end
end
