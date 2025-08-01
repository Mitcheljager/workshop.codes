include Rails.application.routes.url_helpers

desc "Notify posts that are about to expire or have already expired"
task notify_expiry: :environment do
  ActiveRecord::Base.connection_pool.with_connection do
    posts = Post.where("last_revision_created_at > ?", 7.months.ago)

    posts.each do |post|
      next if post.immortal?

      if post.revisions.any? && post.revisions.last.created_at < 5.months.ago
        if post.revisions.any? && post.revisions.last.created_at < 6.months.ago
          has_notification_been_send = Notification.find_by_content_type_and_concerns_model_and_concerns_id(:has_expired, "post", post.id).present?

          unless has_notification_been_send
            Notification.create(
              content:
                "==⚠ The Code for **\"#{ post.title }\"** may have expired.==
                **Workshop Codes in Overwatch may expire after 6 months**. If a code expires, **your work will be lost**.
                You can check if a code has expired by attempting to import it in-game. If you receive an error, your code has expired.
                In the event that your code expires, you can recover it via by copy and pasting a Code Snippet (stored either on Workshop.codes or somewhere else) in Overwatch.",
              go_to: "#{ post_path(post.code) }",
              user_id: post.user.id,
              content_type: :has_expired,
              concerns_model: "post",
              concerns_id: post.id,
              has_been_read: 0
            )
          end
        else
          has_notification_been_send = Notification.find_by_content_type_and_concerns_model_and_concerns_id(:will_expire, "post", post.id).present?

          unless has_notification_been_send
            Notification.create(
              content:
                "==⚠ The Code for **\"#{ post.title }\"** may soon expire.==
                **Workshop Codes in Overwatch may expire after 6 months**. If your code expires, then this code will no longer function and **your code will be lost**.
                Make sure to renew your code by importing it and uploading it to the same code (see [this article](https://workshop.codes/wiki/articles/uploading+new+content+to+existing+import+code) for more information).",
              go_to: "#{ post_path(post.code) }",
              user_id: post.user.id,
              content_type: :will_expire,
              concerns_model: "post",
              concerns_id: post.id,
              has_been_read: 0
            )

            if post.email_notifications.any?
              ExpiryMailer.with(id: post.id, to: post.email_notifications.last.email).will_expire.deliver_now
              post.email_notifications.destroy_all
            end
          end
        end
      end
    end
  end
end
