class ErrorsController < ApplicationController
  def not_found
    render "not_found", status: 404
  end

  def unacceptable
    render "unacceptable", status: 422
  end
end
