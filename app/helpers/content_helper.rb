module ContentHelper
  class HTML < Redcarpet::Render::HTML
    include ActionView::Helpers::AssetTagHelper

    def block_code(code, language)
      "<pre><code class='microlight'>#{ code }</code></pre>"
    end

    def image(link, title, alt_text)
      image_tag(link, title: title, alt: alt_text, loading: "lazy")
    end

    # loosely based on https://github.com/vmg/redcarpet/blob/3e3f0b522fbe9283ba450334b5cec7a439dc0955/ext/redcarpet/html.c#L297
    def header_anchor_hash(title)
      result = ""
      i = 0
      while i < title.length do
        # skip html tags
        if title[i] == "<"
          while title[i] != ">" && i < title.length
            i += 1
          end
        end

        # skip html entities
        if title[i] == "&"
          while title[i] != ";" && i < title.length
            i += 1
          end
        end

        result += title[i]
        i += 1
      end

      result
        .downcase
        .gsub(/[^a-z0-9\- ]/i, "")
        .strip
        .gsub(/ +/, "-")
    end

    def header(title, level)
      tag = "h#{ level }"
      hash = header_anchor_hash(title)

      if @options[:header_anchors]
        "<#{ tag } id='#{ hash }'>
          <a class='header-anchor' href='\##{ hash }' aria-hidden='true'></a>
          #{ title }
        </#{ tag }>"
      else
        "<#{ tag }>#{ title }</#{ tag }>"
      end
    end
  end

  def markdown(text, rendererOptions: {})
    finalRendererOptions = {
      space_after_headers: true,
      header_anchors: false,
      hard_wrap: true,
      link_attributes: { rel: "noreferrer noopener", target: "_blank" }
    }.merge(rendererOptions)

    renderer = HTML.new(finalRendererOptions)
    markdown = Redcarpet::Markdown.new(renderer,
      disable_indented_code_blocks: true,
      highlight: true,
      autolink: true,
      lax_spacing: true,
      tables: true,
      fenced_code_blocks: true
    )

    text = text.gsub(/<script.*?>[\s\S]*<\/script>/i, "")
    text = markdown_youtube(text)
    text = markdown_video(text)
    text = markdown_gallery(text)
    text = markdown_hero_icon(text)
    text = markdown_hero_update(text)
    text = markdown.render(text)

    content = markdown_post_block(text).html_safe
  end

  def markdown_youtube(text)
    text.gsub /\[youtube\s+(.*?)\]/ do
      video_id = $1
      "<div class='video'>
        <iframe class='video__iframe' loading='lazy' width='560' height='315' src='https://www.youtube-nocookie.com/embed/#{ youtube_to_video_id(video_id) }' frameborder='0' allowfullscreen></iframe>
      </div>"
    end
  end

  def markdown_video(text)
    text.gsub /\[video\s(https?:\/\/\S+)(?:\s(autoplay))?\]/ do
      video_url = $1
      autoplay = $2.blank? ? nil : true

      video_element = ActionController::Base.helpers.video_tag("",
        data: { role: "lazy-video", src: video_url, autoplay: autoplay },
        playsinline: true,
        controls: !autoplay,
        muted: autoplay,
        loop: autoplay)

      "<div class='bg-darker'>#{video_element}</div>"
    end
  end

  def markdown_gallery(text)
    text.gsub /\[gallery\s+(.*?)\]/m do
      begin
        images = JSON.parse($1)

        if action_name == "parse_markdown"
          render_to_string partial: "markdown_elements/gallery", locals: { images: images }
        else
          render partial: "markdown_elements/gallery", locals: { images: images }
        end
      rescue
        "<em>An error was found in the gallery</em>"
      end
    end
  end

  def markdown_hero_icon(text)
    text.gsub /\[hero\s+(.*?)\]/ do
      begin
        ActionController::Base.helpers.image_tag(hero_name_to_icon_url($1), width: 55, height: 50, loading: "lazy")
      rescue
      end
    end
  end

  def markdown_post_block(text)
    if @post.present? || action_name == "parse_markdown"
      text.gsub /\[block\s+(.*?)\]/ do
        if action_name == "parse_markdown"
          block = Block.find_by(id: $1)
        else
          block = @post.blocks.find_by(id: $1)
        end

        if block.present?
          if action_name == "parse_markdown"
            render_to_string partial: "blocks/post/#{ block.name }", locals: { block: block }
          else
            render "blocks/post/#{ block.name }", block: block
          end
        end
      end
    else
      text
    end
  end

  def markdown_hero_update(text)
    text.gsub /\[update\s+{(.*?)}\]/m do
      begin
        data = extract_update_data($1)

        hero = data[:hero]
        description = data[:description]
        abilities = data[:abilities]

        if action_name == "parse_markdown"
          render_to_string partial: "markdown_elements/hero_update", locals: { hero: hero, description: description, abilities: abilities }
        else
          render partial: "markdown_elements/hero_update", locals: { hero: hero, description: description, abilities: abilities }
        end
      rescue
        "<em>An error was found in the Hero Update markdown</em>"
      end
    end
  end

  def extract_update_data(input)
    data = {}

    input.scan(/(\w+):\s*"([^"]*)"/) do |key, value|
      data[key.to_sym] = value
    end

    abilities_match = input.match(/abilities:\s*{(.*?)}/m)
    if abilities_match
      abilities_data = extract_abilities_data(abilities_match[1])
      data[:abilities] = abilities_data
    end

    data
  end

  def extract_abilities_data(input)
    abilities_data = {}

    input.scan(/"([^"]+)"\s*:\s*\[([^\]]+)\]/) do |ability, changes|
      abilities_data[ability] = changes.split(",").map { |change| change.strip.gsub(/"([^"]*)"/, "\\1").strip }
    end

    abilities_data
  end

  def hero_name_to_icon_url(hero, size = 50)
    "heroes/#{ size }/#{ hero.downcase.gsub(":", "").gsub(" ", "").gsub(".", "").gsub("ú", "u").gsub("ö", "o") }.png"
  end

  def sanitized_markdown(text, rendererOptions: {})
    ActionController::Base.helpers.sanitize(
      markdown(text, rendererOptions: rendererOptions),
      tags: %w(div span hr style mark dl dd dt img details summary a b iframe audio video source blockquote pre code br p table td tr th thead tbody ul ol li h1 h2 h3 h4 h5 h6 em i strong),
      attributes: %w(style href id class src title width height frameborder allow allowfullscreen alt loading data-autoplay data-src data-action data-target data-tab data-hide-on-close data-toggle-content data-modal data-role data-url data-gallery controls playsinline loop muted)
    )
  end

  def youtube_to_video_id(url)
    return unless url.present?

    url_formats = [
      %r((?:https?://)?youtu\.be/(.+)),
      %r((?:https?://)?(?:www\.)?youtube\.com/watch\?v=(.*?)(&|#|$)),
      %r((?:https?://)?(?:www\.)?youtube\.com/embed/(.*?)(\?|$)),
      %r((?:https?://)?(?:www\.)?youtube\.com/v/(.*?)(#|\?|$)),
      %r((?:https?://)?(?:www\.)?youtube\.com/user/.*?#\w/\w/\w/\w/(.+)\b)
    ]

    url.strip!
    url_format = url_formats.find { |format| url =~ format }

    if url_format.present?
      video_id = url_format and $1
    else
      video_id = url
    end
  end
end
