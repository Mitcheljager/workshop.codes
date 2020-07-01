class Wiki::Article < ApplicationRecord
  if ENV["BONSAI_URL"]
    include Elasticsearch::Model
    include Elasticsearch::Model::Callbacks
  end

  belongs_to :category

  has_one :edit, dependent: :destroy

  attr_accessor :edit_notes

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
          fields: ["title^10", "tags^2", "category.title^1"],
          fuzziness: "AUTO"
        }
      }
    })
  end

  def as_indexed_json(options={})
    self.as_json(include: { category: { only: :title } } )
  end
end
