include Rails.application.routes.url_helpers

class ExpiryMailer < ApplicationMailer
  default from: "notifications@workshop.codes"

  def will_expire
    @post = Post.find(params[:id])
    @user = @post.user
    mail(to: params[:to], subject: "Welcome to My Awesome Site")
  end
end
