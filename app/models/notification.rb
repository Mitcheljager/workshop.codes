class Notification < ApplicationRecord
  belongs_to :user

  enum content_type: { comment: 0, comment_reply: 1, will_expire: 2, has_expired: 3 }
end
