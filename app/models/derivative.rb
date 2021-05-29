class Derivative < ApplicationRecord
  belongs_to :source, foreign_key: "source_id", class_name: "Post"
  belongs_to :derivation, foreign_key: "derivation_id", class_name: "Post"

  validates :source_id, presence: true
  validates :derivation_id, presence: true
  validate :no_self_derive
  validates :derivation_id, uniqueness: { scope: :source_id, message: ' already derives from specified source.' }

  private

  def no_self_derive
    errors.add(:base, 'Post cannot derive from itself') if source == derivation
  end
end
