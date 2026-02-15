module EmailNotificationsHelper
  def create_email_notification(content_type, post_id, email)
    EmailNotification.create(content_type:, post_id:, email:)
  end
end
