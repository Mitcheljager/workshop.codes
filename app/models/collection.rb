class Collection < ApplicationRecord
  belongs_to :user

  has_many :posts, -> { select(:id, :title, :code, :ptr, :overwatch_2_compatible, :image_order, :maps, :user_id, :categories, :created_at, :updated_at, :last_revision_created_at, :immortal, :collection_id ) }

  has_one_attached :cover_image, dependent: :destroy

  enum display_type: { list: 0, cards: 1 }

  attr_accessor :collection_posts

  validates :title, presence: true, length: { minimum: 3, maximum: 50 }
  validates :nice_url, presence: true, uniqueness: true, length: { minimum: 5, maximum: 20 }, format: { with: /\A[a-z0-9-]+\z/, message: "is invalid. Only lowercase letters, numbers, and dashes are allowed." }
  validates :description, length: { maximum: 1000 }
  validates :cover_image, content_type: ["image/png", "image/jpg", "image/jpeg"],
                          size: { less_than: 2.megabytes },
                          dimension: { max: 3500..3500 }
end
