class Article < ApplicationRecord
  has_one_attached :cover_image, dependent: :destroy

  validates :cover_image, content_type: ["image/jpeg", "image/jpg", "image/png"],
                            size: { less_than: 5.megabytes },
                            dimension: { max: 4000..4000 }
end
