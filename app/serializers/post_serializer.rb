class PostSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  include VariantHelper

  attributes :code,
    :nice_url, :title,
    :thumbnail, :carousel_video_youtube_id, :carousel_video_youtube_embed_url,
    :categories, :maps, :heroes, :tags,
    :created_at, :updated_at, :last_revision_created_at

  attribute :snippet_url, if: -> { single? }
  attribute :description, if: -> { single? }
  attribute :images, if: -> { single? }

  belongs_to :user

  def single?
    instance_options[:is_show]
  end

  def thumbnail
    url = ""

    if object.image_order.present? && JSON.parse(object.image_order).length
      image = object.images.find_by_blob_id(JSON.parse(object.image_order).first)

      if image
        url = landscape_small_variant_public_url(image)
      end
    end

    if image.blank?
      random_with_seed = Random.new(object.id).rand(object.maps.length)
      maps_array = YAML.safe_load(File.read(Rails.root.join("config/arrays", "maps.yml")))

      map = maps_array.find { |m| m["name"] == object.maps[random_with_seed - 1] }

      url = root_url + ActionController::Base.helpers.image_url("maps/large/#{ map["slug"] }.jpg")
    end

    url
  end

  def images
    return [] unless object.image_order.present?

    image_ids = JSON.parse(object.image_order)

    urls = []

    image_ids.each do |image_id|
      image = object.images.find_by_blob_id(image_id)

      if image
        url = landscape_large_variant_public_url(image)
        puts url
        urls.push(url)
      end
    end

    urls
  end

  def maps
    object.maps
  end

  def heroes
    object.heroes
  end

  def categories
    object.categories
  end

  def carousel_video_youtube_id
    return nil if object.carousel_video.blank?

    object.carousel_video
  end

  def carousel_video_youtube_embed_url
    return nil if object.carousel_video.blank?

    "https://www.youtube-nocookie.com/embed/" + object.carousel_video
  end

  def snippet_url
    return nil if object.snippet.blank?

    root_url + "get-snippet/" + object.code
  end
end
