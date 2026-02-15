include ApplicationHelper

class ArrayLengthValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.is_a?(String) && value.empty?
    value = JSON.parse(value) if value.is_a?(String)

    return unless options.key?(:maximum)
    return unless value.present?
    maximum = options[:maximum]
    return unless value.count > maximum

    record.errors.add(attribute, :too_long_array, count: maximum)
  end
end

class ArrayPartOfValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless options.key?(:array)
    return unless value.present?

    value.each do |item|
      unless options[:array].include? item
        record.errors.add(attribute, :not_part_of_array)
        return
      end
    end
  end
end

class ArrayNamePartOfValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless options.key?(:array)
    return unless value.present?
    array = options[:array].pluck("name")

    value.each do |item|
      unless array.include? item
        record.errors.add(attribute, :not_part_of_array)
        return
      end
    end
  end
end

class SupportedPlayersValidator < ActiveModel::Validator
  def validate(record)
    unless record.min_players.present? && record.max_players.present?
      record.errors.add :number_of_supported_players, "must be specified."
      return
    end

    unless /\A[+-]?\d+\z/.match? record.min_players.to_s
      record.errors.add :min_players, "supported is not an integer."
    end

    unless /\A[+-]?\d+\z/.match? record.max_players.to_s
      record.errors.add :max_players, "supported is not an integer."
    end

    unless (1..12).include? record.min_players
      record.errors.add :min_players, "supported must be between 1 and 12."
    end

    unless (1..12).include? record.max_players
      record.errors.add :max_players, "supported must be between 1 and 12."
    end

    unless record.min_players <= record.max_players
      record.errors.add :max_players, "supported must not be less than min players supported."
    end
  end
end

class Post < ApplicationRecord
  if ENV["BONSAI_URL"]
    include Elasticsearch::Model
    include Elasticsearch::Model::Callbacks

    settings index: {
      number_of_shards: 1,
      number_of_replicas: 1
    }
  end

  MAX_SOURCES = 5

  belongs_to :user
  belongs_to :collection, optional: true, counter_cache: true

  has_many :favorites, dependent: :destroy
  has_many :revisions, -> { select("created_at", "updated_at", "post_id", "id", "version", "code", "description") }, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :email_notifications, dependent: :destroy
  has_many :blocks, -> { where(content_type: :post).order(position: :asc) }, foreign_key: :content_id, dependent: :destroy

  # Identifies posts which derive from this post
  has_many :deriver_derivs, foreign_key: :source_id, class_name: "Derivative"
  has_many :derivations, through: :deriver_derivs, source: :derivation
  # Identifies posts which this post derives from
  has_many :source_derivs, foreign_key: :derivation_id, class_name: "Derivative", dependent: :destroy
  has_many :sources, through: :source_derivs, source: :source

  has_one_attached :banner_image, dependent: :destroy

  has_many_attached :images, dependent: :destroy
  has_many_attached :videos, dependent: :destroy

  has_recommended :posts

  attr_accessor :status
  attr_accessor :include_nice_url
  attr_accessor :revision
  attr_accessor :revision_description
  attr_accessor :email_notification
  attr_accessor :email
  attr_accessor :new_collection

  serialize :image_order
  serialize :controls
  serialize :categories, JSON
  serialize :heroes, JSON
  serialize :maps, JSON

  validates :user_id, presence: true
  validates :locale, presence: true
  validates :title, presence: true, length: { minimum: 5, maximum: 75 }
  validates :code, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 5, maximum: 6 }, format: { with: /\A[A-Za-z0-9]+\z/, message: "is invalid. Only letters and numbers are allowed." }
  validates :nice_url, uniqueness: true, allow_blank: true, length: { minimum: 7, maximum: 20 }, format: { with: /\A[a-z0-9-]+\z/, message: "is invalid. Only lowercase letters, numbers, and dashes are allowed." }
  validates :description, length: { maximum: POST_DESCRIPTION_LIMIT }
  validates :snippet, length: { maximum: POST_SNIPPET_LIMIT }
  validates :categories, presence: true, array_length: { maximum: 3 }, array_part_of: { array: categories }
  validates :tags, length: { maximum: 100 }
  validates :heroes, presence: true, array_name_part_of: { array: heroes }
  validates :maps, presence: true, array_name_part_of: { array: maps }
  validates :version, length: { maximum: 20 }
  validates :image_order, array_length: { maximum: 30 }
  validates :images, content_type: ["image/png", "image/jpeg", "image/webp"],
                     size: { less_than: 2.megabytes },
                     dimension: { max: 3500..3500 }
  validates :banner_image, content_type: ["image/jpeg", "image/png"],
                           size: { less_than: 2.megabytes },
                           dimension: { max: 3500..3500 }
  validates :videos, content_type: ["video/mp4"], size: { less_than: 50.megabytes }
  validates_with SupportedPlayersValidator

  # Ensure unresolved reports about this post are archived
  before_destroy { |post| Report.where("concerns_model = ? AND concerns_id = ? AND status = ?", "post", post.id, 0).update_all(status: "archived") }

  def self.search(query, size: 50, bypass_cache: true)
    __elasticsearch__.search({
      from: 0,
      size:,
      query: {
        bool: {
          should: [{
            multi_match: {
              query:,
              fields: ["code^5", "title^4", "tags^2", "categories", "maps", "heroes", "user.username^1.5"],
              type: "cross_fields",
              operator: "and",
              tie_breaker: 0.1,
              boost: 100,
              minimum_should_match: "50%"
            }
          }, {
            function_score: {
              query: {
                multi_match: {
                  query:,
                  fields: ["code^4", "title^3", "tags^2.5", "categories", "maps", "heroes", "user.username^1.5"],
                  fuzziness: "AUTO"
                }
              },
              field_value_factor: {
                field: "hotness",
                modifier: "log1p",
                factor: 0.1
              },
              boost_mode: "sum",
              max_boost: 2
            }
          }]
        }
      }
    }).records.ids
  end

  def as_indexed_json(options = {})
    self.as_json(only: [:code, :title, :tags, :categories, :maps, :heroes, :hotness],
                 include: { user: { only: :username } })
  end

  def self.select_overview_columns
    self.select(Post.attribute_names - ["snippet", "description", "controls"])
  end

  def self.visible?
    self.where(private: false, draft: false)
  end

  def self.public?
    self.where(private: false, unlisted: false, draft: false)
  end

  def self.order_by_ids(ids)
    t = Post.arel_table
    condition = Arel::Nodes::Case.new(t[:id])
    ids.each_with_index do |id, index|
      condition.when(id).then(index)
    end
    order(condition)
  end

  def public?
    !private? && !unlisted? && !draft?
  end

  def expired?
    !self.immortal? && self.last_revision_created_at < 6.months.ago
  end

  def parsed_controls
    begin
      JSON.parse(self.controls).presence || []
    rescue JSON::ParserError
      self.controls = "[]"
      self.save touch: false
      retry
    end
  end

  def self.find_by_code(code)
    Post.find_by("upper(code) = ?", code.upcase)
  end

  def new_videos_attached?
    videos_attachments.any? { |attachment| attachment.new_record? }
  end
end
