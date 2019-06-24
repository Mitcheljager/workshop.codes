class Snippet < ApplicationRecord
  belongs_to :user

  enum proficiency: { basic: 0, intermediate: 1, advanced: 2, expert: 3 }

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 5, maximum: 75 }, uniqueness: true
  validates :content, presence: true
  validates :proficiency, presence: true, inclusion: { in: Snippet.proficiencies }
end
