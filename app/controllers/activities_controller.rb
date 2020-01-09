class ActivitiesController < ApplicationController
  before_action do
    redirect_to login_path unless current_user
  end

  def index
    @activities = current_user.activities.order(created_at: :desc).page params[:page]
  end
end
