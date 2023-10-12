class Revision < ApplicationRecord
  belongs_to :post

  validates :post_id, presence: true
  validates :code, presence: true
  validates :description, length: { maximum: REVISION_DESCRIPTION_LIMIT, too_long: "for revision is too long (maximum is 20000 characters)" }
end
