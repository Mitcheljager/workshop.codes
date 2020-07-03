class Wiki::Category < ApplicationRecord
  has_many :articles

  validates :title, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true
  validates :description, length: { maximum: 200 }
end
