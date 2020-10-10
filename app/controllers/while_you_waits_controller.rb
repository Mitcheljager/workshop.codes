class WhileYouWaitsController < ApplicationController
  def index
    if params[:filter]
      @while_you_waits = WhileYouWait.where(category: params[:filter]).includes(:post).order("posts.hotness DESC")
    else
      @while_you_waits = WhileYouWait.all.includes(:post).order("posts.hotness DESC")
    end
  end
end
