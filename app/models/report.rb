class Report < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :reported_user, optional: true, class_name: "User"

  serialize :properties

  validates :category, presence: true
  validates :content, presence: true
  validates :content, length: { maximum: 1000 }
  validates :properties, presence: true

  enum status: { unresolved: 0, accepted: 1, rejected: 2, archived: 3 }
end
