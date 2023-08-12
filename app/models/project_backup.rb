class ProjectBackup < ApplicationRecord
  before_validation :generate_and_set_uuid, on: :create

  belongs_to :project

  validates :parent_uuid, presence: true
  validates :title, presence: true, length: { minimum: 1, maximum: 75 }
  validates :content, length: { maximum: PROJECT_CONTENT_LIMIT }

  private

  def generate_and_set_uuid
    self.uuid = SecureRandom.uuid
  end
end
