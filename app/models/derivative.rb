class Derivative < ApplicationRecord
  belongs_to :source, foreign_key: "source_id", class_name: "Post", optional: true
  belongs_to :derivation, foreign_key: "derivation_id", class_name: "Post"

  validates :source_code, presence: true
  validates :derivation_id, presence: true
  validate :no_self_derive
  validates :source, uniqueness: { scope: :derivation, message: 'already derived from for this post.' }, if: -> { source.present? }
  validates :source_code, uniqueness: { scope: :derivation, message: 'already derived from for this post.' }

  private

  def no_self_derive
    errors.add(:base, 'Post cannot derive from itself') if source == derivation
    errors.add(:base, 'Cannot derive from the same import code') if source_code == derivation&.code
  end
end
