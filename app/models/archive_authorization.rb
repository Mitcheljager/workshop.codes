class ArchiveAuthorization < ApplicationRecord
  validates :code, presence: true, uniqueness: { case_sensitive: false }
end
