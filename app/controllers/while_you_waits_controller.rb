class WhileYouWaitsController < ApplicationController
  def index
    @while_you_waits = WhileYouWait.all.order(impressions_count: :desc)
  end
end
