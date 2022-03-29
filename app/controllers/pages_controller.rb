class PagesController < ApplicationController
  def privacy_policy; end

  def tos; end

  def explanation
    redirect_to "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  end
end
