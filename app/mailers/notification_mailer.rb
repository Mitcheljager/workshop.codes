
class NotificationMailer < ApplicationMailer
  default from: "notifications@workshop.codes"

  def notification
    @user = User.find(params[:user_id])
    @go_to = params[:go_to]
    @content = params[:content].gsub("**", "").gsub("==", "")

    mail(to: @user.email, subject: @content)
  end
end
