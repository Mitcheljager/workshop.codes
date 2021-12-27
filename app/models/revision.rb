class Revision < ApplicationRecord
  belongs_to :post

  validates :post_id, presence: true
  validates :code, presence: true
  validates :description, length: { maximum: REVISION_DESCRIPTION_LIMIT }
end
