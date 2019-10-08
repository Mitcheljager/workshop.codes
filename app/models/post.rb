include ApplicationHelper

class ArrayLengthValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless options.key?(:maximum)
    return unless value
    maximum = options[:maximum]
    array = JSON.parse value
    return unless array.count > maximum

    record.errors.add(attribute, :too_long_array, count: maximum)
  end
end

class ArrayPartOfValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless options.key?(:array)
    return unless value
    value_array = JSON.parse value

    value_array.each do |item|
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
    value_array = JSON.parse value

    value_array.each do |item|
      unless array.include? item
        record.errors.add(attribute, :not_part_of_array)
        return
      end
    end
  end
end

class Post < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  is_impressionable counter_cache: true, unique: true

  belongs_to :user
  has_many :favorites, dependent: :destroy
  has_many :revisions, dependent: :destroy
  has_many :comments, dependent: :destroy

  attr_accessor :revision
  attr_accessor :revision_description

  validates :user_id, presence: true
  validates :title, presence: true, length: { minimum: 5, maximum: 75 }
  validates :code, presence: true, uniqueness: true, length: { minimum: 5, maximum: 5 }
  validates :categories, presence: true, array_length: { maximum: 3 }, array_part_of: { array: categories }
  validates :tags, length: { maximum: 100 }
  validates :heroes, presence: true, array_name_part_of: { array: heroes }
  validates :maps, presence: true, array_name_part_of: { array: maps }
  validates :version, length: { maximum: 20 }

  def self.search(query)
    __elasticsearch__.search({
      query: {
        multi_match: {
          query: query,
          fields: ["code^10", "title^5", "categories^2", "maps^2", "heroes^2", "tags"],
          fuzziness: "AUTO"
        }
      }
    })
  end
end
