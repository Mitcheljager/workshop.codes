# Preview all emails at http://localhost:3000/rails/mailers/notification_mailer
class NotificationMailerPreview < ActionMailer::Preview
  def notification
    NotificationMailer.with(user_id: 0, go_to: "/some-notification", content: "I am a notification!").notification
  end
end
