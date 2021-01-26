class Admin::EmailNotificationsController < Admin::BaseController
  def index
    @email_notifications = EmailNotification.order(created_at: :desc).page(params[:page])
    @forgot_password_tokens = ForgotPasswordToken.order(created_at: :desc).page(params[:page])
  end
end
