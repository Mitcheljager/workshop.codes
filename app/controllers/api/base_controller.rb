class Api::BaseController < ApplicationController
  before_action { request.format = :json }

  def index
    render json: { message: "Hey!" }
  end
end
