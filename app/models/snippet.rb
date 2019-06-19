class Snippet < ApplicationRecord
  belongs_to :user

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 5, maximum: 75 }, uniqueness: true
  validates :content, presence: true
end
