class Post < ApplicationRecord
  belongs_to :user
  has_many :favorites, dependent: :destroy

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 5 }
  validates :code, presence: true, length: { minimum: 5, maximum: 5 }
  validates :categories, presence: true
  validates :heroes, presence: true
  validates :maps, presence: true
end
