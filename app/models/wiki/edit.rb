class Wiki::Edit < ApplicationRecord
  belongs_to :user
  belongs_to :article

  enum content_type: {
    created: 0,
    edited: 1,
    removed: 2
  }
end
