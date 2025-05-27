class PostSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :code,
    :nice_url, :title,
    :thumbnail, :images, :carousel_video_youtube_id, :carousel_video_youtube_embed_url,
    :categories, :maps, :heroes, :tags,
    :created_at, :updated_at, :last_revision_created_at

  belongs_to :user

  def thumbnail
    url = ""

    if object.image_order.present? && JSON.parse(object.image_order).length
      image = object.images.find_by_blob_id(JSON.parse(object.image_order).first)

      if image
        url = rails_public_blob_url(image.variant(quality: 95, resize_to_fill: [600, 342]).processed)
      end
    end

    if image.blank?
      random_with_seed = Random.new(object.id).rand(object.maps.length)
      maps_array = YAML.safe_load(File.read(Rails.root.join("config/arrays", "maps.yml")))

      map = maps_array.find { |m| m["name"] == object.maps[random_with_seed - 1] }

      url = root_url + ActionController::Base.helpers.image_url("maps/large/#{ map["slug"] }.jpg")
    end

    return url
  end

  def images
    return [] unless object.image_order.present?

    image_ids = JSON.parse(object.image_order)

    urls = []

    image_ids.each do |image_id|
      image = object.images.find_by_blob_id(image_id)

      if image
        url = rails_public_blob_url(image.variant(quality: 95, resize_to_fill: [900, 560]).processed)
        puts url
        urls.push(url)
      end
    end

    return urls
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
    object.carousel_video
  end

  def carousel_video_youtube_embed_url
    "https://www.youtube-nocookie.com/embed/" + object.carousel_video
  end
end
