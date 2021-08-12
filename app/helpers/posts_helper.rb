module PostsHelper
  def url_for_post_thumbnail(post, width = 120, height = 68, size = "small")
    url = ""

    if post.image_order.present? && JSON.parse(post.image_order).length
      begin
        image = post.images.find_by_blob_id(JSON.parse(post.image_order).first)

        if image
          url = rails_public_blob_url(image.variant(quality: 90, resize_to_fill: [width, height], format: :webp).processed)
        end
      rescue
      end
    end

    unless url.present?
      random_with_seed = Random.new(post.id).rand(post.maps.length)
      map = maps.find { |m| m["en"] == post.maps[random_with_seed - 1] }

      url = image_path "maps/#{ size }/webp/#{ map["slug"] }.webp"
    end

    return url
  end

  def has_player_range?(post)
    post.min_players.present? && post.max_players.present?
  end
  
  def controls_button_value(item, index)
    if item && item["buttons"]
      if item["buttons"][index] && item["buttons"][index]["Custom"]
        "Custom"
      else
        item["buttons"][index]
      end
    else
      ""
    end
  end

  def controls_button_custom_value(item, index)
    if controls_button_value(item, index) == "Custom"
      item["buttons"][index]["Custom"]
    else
      ""
    end
  end

  def is_active_tab?(tab)
    return true if tab == "" && params[:tab].nil? || params[:tab] == tab
    return false
  end

  def tabs_content_tag(name, alt_url = nil, extra_class = "item__content")
    tag.div class: "#{ extra_class } tabs-content #{ "tabs-content--active" if is_active_tab?(alt_url || name) }",
            data: { tab: name, partial: name } do
      yield
    end
  end
end
