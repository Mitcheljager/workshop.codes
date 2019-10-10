module NotificationsHelper
  def create_notification(content, go_to = "", user_id)
    Notification.create!(content: content, go_to: go_to, user_id: user_id, has_been_read: 0)
  end
end
