class Post < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  settings do
    mappings dynamic: "false" do
      indexes :title, analyzer: "english", index_options: "offsets"
      indexes :tags, analyzer: "english"
      indexes :category, analyzer: "english"
    end
  end

  belongs_to :user

  validates :user_id, presence: true
  validates :title, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 5 }
  validates :code, presence: true, length: { minimum: 5 }
  validates :categories, presence: true
  validates :heroes, presence: true
  validates :maps, presence: true

  def self.search(query)
    __elasticsearch__.search({
      query: {
        multi_match: {
          query: query,
          fields: ["title^10", "category", "tags"]
        }
      }
    })
  end
end

Post.__elasticsearch__.client.indices.delete index: Post.index_name rescue nil
Post.__elasticsearch__.client.indices.create \
  index: Post.index_name,
  body: { settings: Post.settings.to_hash, mappings: Post.mappings.to_hash }
Post.import force:true
