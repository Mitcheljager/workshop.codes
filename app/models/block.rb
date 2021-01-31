class Block < ApplicationRecord
  belongs_to :user

  enum content_type: { profile: 0, post: 1 }

  serialize :properties

  validates :name, presence: true
  validates :content_type, presence: true
  validates :user_id, presence: true
end
