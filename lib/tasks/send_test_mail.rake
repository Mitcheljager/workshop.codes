desc "Send test email"
task send_test_mail: :environment do
  ExpiryMailer.with(id: Post.last.id, to: "mitchel_jager@hotmail.com").will_expire.deliver_now
end
