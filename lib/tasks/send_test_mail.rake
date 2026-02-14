desc "Send test email"
task send_test_mail: :environment do
  ExpiryMailer.with(id: Post.last.id, to: "1eu6pc3sq@mozmail.com").will_expire.deliver_now
end
