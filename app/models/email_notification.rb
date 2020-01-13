class EmailNotification < ApplicationRecord
  belongs_to :post

  encrypts :email

  enum content_type: { will_expire: 0 }
end
