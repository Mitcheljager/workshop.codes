class Collection < ApplicationRecord
  belongs_to :user

  has_many :posts, -> { select(:id, :title, :code, :ptr, :overwatch_2_compatible, :image_order, :maps, :user_id, :categories, :updated_at, :last_revision_created_at, :immortal ) }

  has_one_attached :cover_image, dependent: :destroy

  enum display_type: { list: 0, cards: 1 }

  validates :title, presence: true, length: { minimum: 3, maximum: 50 }
  validates :description, length: { maximum: 1000 }
  validates :cover_image, content_type: ["image/png", "image/jpg", "image/jpeg"],
                          size: { less_than: 2.megabytes },
                          dimension: { max: 3500..3500 }
end
