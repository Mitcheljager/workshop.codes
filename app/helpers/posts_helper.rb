module PostsHelper
  def url_for_post_thumbnail(post, width = 120, height = 68, size = "small")
    url = ""

    if post.image_order.present? && JSON.parse(post.image_order).length
      begin
        image = post.images.find_by_blob_id(JSON.parse(post.image_order).first)

        if image
          url = url_for image.variant(quality: 90, resize_to_fill: [width, height]).processed
        end
      rescue
      end
    end

    unless url.present?
      random_with_seed = Random.new(post.id).rand(post.maps.length)
      map = maps.find { |m| m["name"] == post.maps[random_with_seed - 1] }

      url = image_path "maps/#{ size }/#{ map["slug"] }.jpg"
    end

    return url
  end
end
