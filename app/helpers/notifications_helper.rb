module NotificationsHelper
  def create_notification(content, go_to, user_id, content_type, concerns_model, concerns_id)
    Notification.create!(content: content, go_to: go_to, user_id: user_id, has_been_read: 0, content_type: content_type, concerns_model: concerns_model, concerns_id: concerns_id)
  end
end
