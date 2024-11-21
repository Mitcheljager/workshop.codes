class Article < ApplicationRecord
  has_one_attached :cover_image, dependent: :destroy
  has_many_attached :images, dependent: :destroy

  validates :cover_image, content_type: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
                            size: { less_than: 5.megabytes },
                            dimension: { max: 4000..4000 }
  validates :images, content_type: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
                            size: { less_than: 2.megabytes }
end
