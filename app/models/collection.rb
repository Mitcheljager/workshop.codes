class Collection < ApplicationRecord
  belongs_to :user

  has_many :posts, -> { select(:id, :title, :code, :ptr, :overwatch_2_compatible, :image_order, :maps, :user_id, :categories, :updated_at, :last_revision_created_at, :immortal ) }

  has_one_attached :cover_image, dependent: :destroy

  validates :title, presence: true, length: { minimum: 3, maximum: 50 }
end
