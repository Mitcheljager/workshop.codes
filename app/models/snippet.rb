class Snippet < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  is_impressionable counter_cache: true, unique: true

  belongs_to :user

  enum proficiency: { basic: 0, intermediate: 1, advanced: 2, expert: 3 }

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 5, maximum: 75 }, uniqueness: true
  validates :content, presence: true
  validates :proficiency, presence: true, inclusion: { in: Snippet.proficiencies }

  def self.search(query)
    __elasticsearch__.search({
      query: {
        multi_match: {
          query: query,
          fields: ["title^5"],
          fuzziness: "AUTO"
        }
      }
    })
  end
end

Snippet.__elasticsearch__.create_index! force: true
Snippet.import
