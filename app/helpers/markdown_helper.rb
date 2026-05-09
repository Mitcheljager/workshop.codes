module MarkdownHelper
  class HTML < Redcarpet::Render::HTML
    include ActionView::Helpers::AssetTagHelper

    def block_code(code, language)
      "<pre><code class='microlight'>#{ code }</code></pre>"
    end

    def image(link, title, alt_text)
      alt_text = "" if alt_text == "Text description"
      image_tag(link, title:, alt: alt_text || "", loading: "lazy")
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
        "<#{ tag } id='#{ hash }' aria-level='2'>
          <a class='header-anchor' href='\##{ hash }' aria-hidden='true'></a>
          #{ title }
        </#{ tag }>"
      else
        "<#{ tag } aria-level='2'>#{ title }</#{ tag }>"
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
    text = markdown_ability_icon(text)
    text = markdown_hero_icon(text)
    text = markdown_update_notes(text)
    text = markdown.render(text)

    markdown_post_block(text).html_safe
  end

  def sanitized_markdown(text, rendererOptions: {})
    ActionController::Base.helpers.sanitize(
      markdown(text, rendererOptions:),
      tags: %w[div span hr style mark dl dd dt img details summary a button b iframe audio video source blockquote pre code br p table td tr th thead tbody ul ol li h1 h2 h3 h4 h5 h6 em i strong big sub sup],
      attributes: %w[style href id class src srcset title width height frameborder allow allowfullscreen alt loading data-autoplay data-src data-action data-target data-tab data-hide-on-close data-toggle-content data-modal data-role data-url data-gallery data-id controls playsinline loop muted aria-level aria-label aria-labelledby aria-hidden aria-expanded tabindex role]
    )
  end

  def markdown_youtube(text)
    text.gsub(/\[youtube\s+(.*?)\]/) do
      youtube_preview_tag($1, true)
    end
  end

  def markdown_video(text)
    text.gsub(/\[video\s(https?:\/\/\S+)(?:\s(autoplay))?\]/) do
      video_url = $1
      autoplay = $2.blank? ? nil : true

      video_element = ActionController::Base.helpers.video_tag("",
        data: { role: "lazy-video", src: video_url, autoplay: },
        playsinline: true,
        controls: !autoplay,
        muted: autoplay,
        loop: autoplay)

      "<div class='bg-darker'>#{video_element}</div>"
    end
  end

  def markdown_gallery(text)
    text.gsub(/\[gallery\s+([^\]]+)\]/m) do
      begin
        images = JSON.parse($1.strip)

        if action_name == "parse_markdown"
          render_to_string partial: "markdown_elements/gallery", locals: { images: }
        else
          render partial: "markdown_elements/gallery", locals: { images: }
        end
      rescue
        "<em>An error was found in the gallery</em>"
      end
    end
  end

  def markdown_hero_icon(text)
    text.gsub(/\[hero\s+([\p{L}\p{N}_:.\-\s]+)\s*(?:\{([^}]*)\})?\s*\]/) do
      begin
        hero_name = ERB::Util.html_escape($1.strip)

        config = YAML.load("{#{$2}}".strip)

        size = 50
        size = 100 if config["size"] == "medium"
        size = 256 if config["size"] == "large"

        type = config["type"]&.downcase == "3d" ? "3d" : "2d"

        ActionController::Base.helpers.vite_image_tag(hero_name_to_icon_url(hero_name, size, type), width: size, height: size, loading: "lazy", alt: hero_name)
      rescue
        nil
      end
    end
  end

  def markdown_ability_icon(text)
    text.gsub(/\[ability\s+([\p{L}\p{N}_:.\(\)\-\s]+)\]/) do
      begin
        ability_name = ERB::Util.html_escape($1.strip)
        ActionController::Base.helpers.vite_image_tag(ability_name_to_icon_url(ability_name), height: 50, loading: "lazy", alt: $1)
      rescue; end
    end
  end

  def markdown_post_block(text)
    if @post.present? || action_name == "parse_markdown"
      text.gsub(/\[block\s+(.*?)\]/) do
        if action_name == "parse_markdown"
          block = Block.find_by(id: $1)
        else
          block = @post.blocks.find_by(id: $1)
        end

        if block.present?
          if action_name == "parse_markdown"
            render_to_string partial: "blocks/post/#{ block.name }", locals: { block: }
          else
            render "blocks/post/#{ block.name }", block:
          end
        end
      end
    else
      text
    end
  end

  def markdown_update_notes(text)
    text.gsub(/\[update\s+{(.*?)}\]/m) do
      begin
        data = YAML.load("{#{$1}}")

        hero = data["hero"]
        title = data["title"]
        description = data["description"]
        abilities = data["abilities"]
        icons = data["icons"] || {}

        if action_name == "parse_markdown"
          render_to_string partial: "markdown_elements/update_notes", locals: { hero:, title:, description:, abilities:, icons: }
        else
          render partial: "markdown_elements/update_notes", locals: { hero:, title:, description:, abilities:, icons: }
        end
      rescue
        "<em>An error was found in the Hero Update markdown</em>"
      end
    end
  end
end
