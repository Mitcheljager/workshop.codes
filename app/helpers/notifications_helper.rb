module NotificationsHelper
  def create_notification(content, go_to, user_id, content_type, concerns_model, concerns_id)
    user = User.find(user_id)

    return unless user.present?

    Notification.create(
      content: content,
      go_to: go_to,
      user_id: user.id,
      has_been_read: 0,
      content_type: content_type,
      concerns_model: concerns_model,
      concerns_id: concerns_id
    )

    if user.send_email_on_notification? && user.email.present?
      NotificationMailer.with(content: content, go_to: go_to, user_id: user.id).notification.deliver_later
    end
  end
end
