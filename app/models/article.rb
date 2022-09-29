class Article < ApplicationRecord
  has_one_attached :cover_image, dependent: :destroy

  validates :cover_image, content_type: ["image/jpeg", "image/jpg", "image/png"],
                            size: { less_than: 2.megabytes },
                            dimension: { max: 3500..3500 }
end
