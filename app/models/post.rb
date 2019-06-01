class Post < ApplicationRecord
  belongs_to :user

  validates :user_id, presence: true
  validates :title, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 5 }
  validates :code, presence: true, length: { minimum: 5 }
  validates :categories, presence: true
  validates :heroes, presence: true
  validates :maps, presence: true
end
