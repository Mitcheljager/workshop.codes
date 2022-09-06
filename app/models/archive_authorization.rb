class ArchiveAuthorization < ApplicationRecord
  validates :code, presence: true, uniqueness: { case_sensitive: false }
  validates :bnet_id, presence: true, numericality: { only_integer: true, greater_than: 0 }, length: { minimum: 6 }
end
