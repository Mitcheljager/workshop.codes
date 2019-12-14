class WhileYouWaitsController < ApplicationController
  def index
    @while_you_waits = WhileYouWait.all.includes(:post).order("posts.impressions_count DESC")
  end
end
