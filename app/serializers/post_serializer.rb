class PostSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :code, :nice_url, :title, :thumbnail, :description, :snippet, :categories, :maps, :heroes, :tags, :created_at, :updated_at

  belongs_to :user

  def thumbnail
    url = ""

    if object.image_order.present? && JSON.parse(object.image_order).length
      image = object.images.find_by_blob_id(JSON.parse(object.image_order).first)

      if image
        url = url_for image.variant(quality: 90, resize_to_fill: [120, 68]).processed
      end
    end

    unless url.present?
      random_with_seed = Random.new(object.id).rand(object.maps.length)
      maps_array = YAML.load(File.read(Rails.root.join("config/arrays", "maps.yml")))

      map = maps_array.find { |m| m["name"] == object.maps[random_with_seed - 1] }

      url = ActionController::Base.helpers.image_url "maps/small/#{ map["slug"] }.jpg"
    end

    return url
  end

  def maps
    object.maps
  end

  def heroes
    object.heroes
  end
end
