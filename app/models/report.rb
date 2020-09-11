class Report < ApplicationRecord
  belongs_to :user, optional: true

  validates :category, presence: true
  validates :content, length: { maximum: 1000 }

  enum status: { unresolved: 0, accepted: 1, rejected: 2 }
end
