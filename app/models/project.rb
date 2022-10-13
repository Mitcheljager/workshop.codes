class Project < ApplicationRecord
  before_validation :generate_and_set_uuid, on: :create

  belongs_to :user

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 1, maximum: 75 }
  validates :content, length: { maximum: POST_SNIPPET_LIMIT }

  private

  def generate_and_set_uuid
    self.uuid = SecureRandom.uuid
  end
end
