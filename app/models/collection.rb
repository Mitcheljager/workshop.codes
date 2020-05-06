class Collection < ApplicationRecord
  belongs_to :user

  has_many :posts

  validates :title, presence: true, length: { minimum: 3, maximum: 50 }
end
