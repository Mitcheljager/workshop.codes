# Preview all emails at http://localhost:3000/rails/mailers/expiry_mailer
class ExpiryMailerPreview < ActionMailer::Preview
  def will_expire
    ExpiryMailer.with(id: Post.last.id).will_expire
  end
end
