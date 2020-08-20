module PostsHelper
  def url_for_post_thumbnail(post)
    if post.image_order.present? && JSON.parse(post.image_order).length
      image = post.images.find_by_blob_id(JSON.parse(post.image_order).first)

      url_for image.variant(quality: 85, resize_to_fill: [120, 68]).processed
    else
      random_with_seed = Random.new(post.id).rand(JSON.parse(post.maps).length)
      map = maps.find { |m| m["name"] == JSON.parse(post.maps)[random_with_seed - 1] }

      "maps/small/#{ map["slug"] }.jpg"
    end
  end
end
