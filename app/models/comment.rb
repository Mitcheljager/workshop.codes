class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post, counter_cache: true

  validates :user_id, presence: true
  validates :content, presence: true, length: { minimum: 1, maximum: 2000 }

  before_destroy { |comment| Comment.where(parent_id: comment.id).destroy_all }
end
