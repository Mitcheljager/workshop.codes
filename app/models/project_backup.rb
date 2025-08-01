class ProjectBackup < ApplicationRecord
  self.primary_key = "uuid"

  before_validation :generate_and_set_uuid, on: :create

  belongs_to :project, foreign_key: :project_uuid

  validates :project_uuid, presence: true
  validates :title, presence: true, length: { minimum: 1, maximum: 75 }
  validates :content, length: { maximum: PROJECT_CONTENT_LIMIT }

  private

  def generate_and_set_uuid
    self.uuid = SecureRandom.uuid
  end
end
