include ApplicationHelper

class ArrayLengthValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless options.key?(:maximum)
    return unless value
    maximum = options[:maximum]
    return unless value.count > maximum

    record.errors.add(attribute, :too_long_array, count: maximum)
  end
end

class ArrayPartOfValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless options.key?(:array)
    return unless value

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
    return unless value
    array = options[:array].pluck("name")

    value.each do |item|
      unless array.include? item
        record.errors.add(attribute, :not_part_of_array)
        return
      end
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

  belongs_to :user
  belongs_to :collection, optional: true

  has_many :favorites, dependent: :destroy
  has_many :revisions, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :while_you_waits, dependent: :destroy
  has_many :email_notifications, dependent: :destroy

  has_many_attached :images, dependent: :destroy

  attr_accessor :status
  attr_accessor :include_nice_url
  attr_accessor :revision
  attr_accessor :revision_description
  attr_accessor :email_notification
  attr_accessor :email
  attr_accessor :new_collection

  serialize :image_order
  serialize :categories, JSON
  serialize :heroes, JSON
  serialize :maps, JSON

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 5, maximum: 75 }
  validates :code, presence: true, uniqueness: { case_sensitive: false }, length: { minimum: 5, maximum: 6 }, format: { with: /\A[A-Za-z0-9]+\z/, message: "is invalid. Only letters and numbers are allowed." }
  validates :nice_url, uniqueness: true, allow_blank: true, length: { minimum: 7, maximum: 20 }, format: { with: /\A[a-z0-9-]+\z/, message: "is invalid. Only lowercase letter, numbers, and dashes are allowed." }
  validates :categories, presence: true, array_length: { maximum: 3 }, array_part_of: { array: categories }
  validates :tags, length: { maximum: 100 }
  validates :heroes, presence: true, array_name_part_of: { array: heroes }
  validates :maps, presence: true, array_name_part_of: { array: maps }
  validates :version, length: { maximum: 20 }
  validates :images, content_type: ["image/jpeg"],
                     size: { less_than: 0.5.megabytes }

  def self.search(query)
    __elasticsearch__.search({
      from: 0,
      size: 100,
      query: {
        function_score: {
          query: {
            multi_match: {
              query: query,
              fields: ["code^2.5", "title^2", "tags^2", "categories", "maps", "heroes", "user.username^1.5"],
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
      }
    })
  end

  def as_indexed_json(options={})
    self.as_json(include: { user: { only: :username } } )
  end

  def self.locale
    if I18n.locale && I18n.locale != :mixed
      self.where(locale: I18n.locale)
    else
      self
    end
  end

  def self.visible?
    self.where(private: false)
  end

  def self.public?
    self.where(private: false, unlisted: false)
  end
end
