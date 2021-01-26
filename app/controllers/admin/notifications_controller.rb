class Admin::NotificationsController < Admin::BaseController
  def index
    @notifications = Notification.order(created_at: :desc).page(params[:page])
  end
end
