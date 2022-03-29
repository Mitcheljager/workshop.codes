class PagesController < ApplicationController
  def privacy_policy; end

  def tos; end

  def explanation
    if ENV["APRIL_FOOLS_CHANCE"].present?
      redirect_to "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    else
      raise ActionController::RoutingError.new("Not Found")
    end
  end
end
