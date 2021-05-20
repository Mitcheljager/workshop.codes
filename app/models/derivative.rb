class Derivative < ApplicationRecord
  belongs_to :source, foreign_key: "source_id", class_name: "Post"
  belongs_to :derivation, foreign_key: "derivation_id", class_name: "Post"

  validate :no_self_derive

  private

  def no_self_derive
    errors.add(:base, 'Post cannot derive from itself') if source == derivation
  end
end
