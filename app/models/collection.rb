class Collection < ApplicationRecord
  belongs_to :user

  has_many :posts, -> { select(:id, :title, :code, :ptr, :overwatch_2_compatible, :image_order, :maps, :user_id, :categories, :updated_at, :last_revision_created_at, :immortal ) }

  validates :title, presence: true, length: { minimum: 3, maximum: 50 }
end
