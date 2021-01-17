class Wiki::Article < ApplicationRecord
  if ENV["BONSAI_URL"]
    include Elasticsearch::Model
    include Elasticsearch::Model::Callbacks

    settings index: {
      number_of_shards: 1,
      number_of_replicas: 1
    }
  end

  belongs_to :category

  has_one :edit, dependent: :destroy

  attr_accessor :edit_notes

  validates :title, presence: true, length: { minimum: 2, maximum: 120 }
  validates :slug, presence: true

  def self.approved
    where(edit: Wiki::Edit.where(approved: true))
  end

  def self.search(query)
    __elasticsearch__.search({
      from: 0,
      size: 20,
      query: {
        multi_match: {
          query: query,
          fields: ["title^2", "tags^1.75", "category.title^1", "content"],
          fuzziness: "AUTO"
        }
      }
    })
  end

  def as_indexed_json(options={})
    self.as_json(include: { category: { only: :title } } )
  end
end
