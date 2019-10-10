class NotificationsController < ApplicationController
  def index
    @notifcations = current_user.notifications.where(has_been_read: 0)
  end

  def create
  end

  def update
  end
end
