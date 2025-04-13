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
  has_many_attached :images, dependent: :destroy
  has_many_attached :videos, dependent: :destroy

  attr_accessor :edit_notes

  validates :title, presence: true, length: { minimum: 2, maximum: 120 }
  validates :slug, presence: true
  validates :content, length: { maximum: WIKI_ARTICLE_CONTENT_LIMIT }
  validates :tags, length: { maximum: 1000 }
  validates :images, content_type: ["image/png", "image/jpeg", "image/webp"],
                     size: { less_than: 2.megabytes }

  def self.search(query, size=100)
    __elasticsearch__.search({
      from: 0,
      size: size,
      query: {
        bool: {
          should: [{
            multi_match: {
              query: query,
              fields: ["title"],
              type: "cross_fields",
              operator: "and",
              tie_breaker: 0.1,
              boost: 100,
              minimum_should_match: "25%"
            }
          }, {
            multi_match: {
              query: query,
              fields: ["title^2", "tags^1.5", "category.title"],
              fuzziness: "AUTO"
            }
          }]
        }
      }
    }).records.ids
  end

  def self.order_by_ids(ids)
    t = Wiki::Article.arel_table
    condition = Arel::Nodes::Case.new(t[:id])
    ids.each_with_index do |id, index|
      condition.when(id).then(index)
    end
    order(condition)
  end

  def as_indexed_json(options={})
    self.as_json(only: [:title, :tags], include: { category: { only: :title } } )
  end
end
