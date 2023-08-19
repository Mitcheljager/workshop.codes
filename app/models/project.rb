class Project < ApplicationRecord
  self.primary_key = 'uuid'

  before_validation :generate_and_set_uuid, on: :create

  belongs_to :user

  has_many :project_backups, -> { select(:uuid, :project_uuid, :created_at) }, class_name: "ProjectBackup", foreign_key: :project_uuid, dependent: :destroy

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 1, maximum: 75 }
  validates :content, length: { maximum: PROJECT_CONTENT_LIMIT }
  validates :content_type, presence: true

  attr_accessor :is_owner

  enum content_type: {
    workshop_codes: 0,
    zez_ui: 1
  }

  private

  def generate_and_set_uuid
    self.uuid = SecureRandom.uuid
  end
end
