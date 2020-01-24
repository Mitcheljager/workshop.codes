# Preview all emails at http://localhost:3000/rails/mailers/expiry_mailer
class ForgotPasswordsMailerPreview < ActionMailer::Preview
  def send_token
    ForgotPasswordsMailer.with(token: ForgotPasswordToken.last.token).send_token
  end
end
