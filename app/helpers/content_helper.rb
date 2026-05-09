module ContentHelper
  def hero_name_to_slug(hero)
    hero.downcase.gsub(":", "").gsub(" ", "").gsub(".", "").gsub("ú", "u").gsub("ö", "o")
  end

  def hero_name_to_icon_url(hero, size = 50, type = "2d")
    string = "images/heroes/#{ type }/#{ size }/#{ hero_name_to_slug(hero) }.png"
    asset_exists?(string) ? string : nil
  end

  def ability_name_to_slug(ability)
    ability.downcase.gsub(":", "").gsub(" ", "-").gsub("!", "").gsub("(", "").gsub(")", "").gsub("'", "").gsub(".", "")
  end

  def ability_name_to_icon_url(ability, size = 50)
    string = "images/abilities/#{ size }/#{ ability_name_to_slug(ability) }.png"
    asset_exists?(string) ? string : nil
  end

  def youtube_to_video_id(url)
    return unless url.present?

    url_formats = [
      %r{(?:https?://)?youtu\.be/(.+)},
      %r{(?:https?://)?(?:www\.)?youtube\.com/watch\?v=(.*?)(&|#|$)},
      %r{(?:https?://)?(?:www\.)?youtube\.com/embed/(.*?)(\?|$)},
      %r{(?:https?://)?(?:www\.)?youtube\.com/v/(.*?)(#|\?|$)},
      %r{(?:https?://)?(?:www\.)?youtube\.com/user/.*?#\w/\w/\w/\w/(.+)\b}
    ]

    url.strip!
    url_format = url_formats.find { |format| url =~ format }

    if url_format.present?
      video_id = url_format and $1
    else
      video_id = url
    end
  end

  def ability_icons
    abilities.map do |ability_hash|
      ability_hash.map do |key, value|
        {
          name: key,
          url: vite_asset_url(ability_name_to_icon_url(key)),
          terms: value
        }
      end
    end.flatten
  end

  def hero_names
    heroes.map { |hero| hero["name"] }.sort
  end

  # This uses a string instead of Rails tags because those tags are not available when parsed as JSON
  def youtube_preview_tag(video_id, lazy = false)
    "<div class='video'>
      <div class='video__preview' data-action='youtube-preview' data-id='#{ video_id }' role='button' aria-label='Play YouTube video' tabindex='0'>
        <div class='video__play-icon'></div>
        <img
          #{ lazy ? "loading='lazy'" : "" }
          width='836'
          height='464'
          src='https://i.ytimg.com/vi_webp/#{ video_id }/sddefault.webp'
          srcset='https://i.ytimg.com/vi_webp/#{ video_id }/sddefault.webp 640w, https://i.ytimg.com/vi_webp/#{ video_id }/maxresdefault.webp 1280w'
          class='video__thumbnail'
          alt='' />
      </div>
    </div>".gsub("\n", "") # For some reason Markdown after this element is ignored when newlines are present
  end
end
