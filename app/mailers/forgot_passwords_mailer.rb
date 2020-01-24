
class ForgotPasswordsMailer < ApplicationMailer
  include Rails.application.routes.url_helpers

  default from: "accounts@workshop.codes"

  def send_token
    @forgot_password_token = ForgotPasswordToken.find_by_token(params[:token])
    @user = @forgot_password_token.user

    mail(to: @user.email, subject: "Reset your password")
  end
end
