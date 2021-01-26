class Admin::ActivitiesController < Admin::BaseController
  def index
    @activities = Activity.order(created_at: :desc).page(params[:page])
  end
end
