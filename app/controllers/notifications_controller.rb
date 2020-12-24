class NotificationsController < ApplicationController
  before_action do
    redirect_to login_path unless current_user
  end

  def index
    @notifications = current_user.notifications.order(created_at: :desc).page(params[:page])
  end

  def get_unread_notifications
    @notifications = current_user.notifications.where(has_been_read: false)

    render json: @notifications, layout: false
  end
end
