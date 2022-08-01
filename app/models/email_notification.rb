class EmailNotification < ApplicationRecord
  belongs_to :post

  has_encrypted :email

  enum content_type: { will_expire: 0 }
end
