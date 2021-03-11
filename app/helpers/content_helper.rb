module ContentHelper
  class HTML < Redcarpet::Render::HTML
    include ActionView::Helpers::AssetTagHelper

    def block_code(code, language)
      "<pre><code class='microlight'>#{ code }</code></pre>"
    end

    def image(link, title, alt_text)
      image_tag(link, title: title, alt: alt_text, loading: "lazy")
    end
  end

  def markdown(text)
    options = {
      space_after_headers: true,
      hard_wrap: true,
      link_attributes: { rel: "noreferrer noopener", target: "_blank" }
    }

    renderer = HTML.new(options)
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
    text = markdown_gallery(text)
    text = markdown_hero_icon(text)
    text = markdown_post_block(text)

    content = markdown.render(text).html_safe
  end

  def markdown_youtube(text)
    text.gsub /\[youtube\s+(.*?)\]/ do
      video_id = $1
      "<div class='video'>
        <iframe class='video__iframe' loading='lazy' width='560' height='315' src='https://www.youtube-nocookie.com/embed/#{ youtube_to_video_id(video_id) }' frameborder='0' allowfullscreen></iframe>
      </div>"
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
      ActionController::Base.helpers.image_tag(hero_name_to_icon_url($1), width: 55, height: 50, loading: "lazy")
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

  def hero_name_to_icon_url(hero, size = 50)
    "heroes/50/#{ hero.downcase.gsub(":", "").gsub(" ", "").gsub(".", "").gsub("ú", "u").gsub("ö", "o") }.png"
  end

  def sanitized_markdown(text)
    ActionController::Base.helpers.sanitize(markdown(text), tags: %w(div span hr style mark dl dd dt img details summary a b iframe audio source blockquote pre code br p table td tr th thead tbody ul ol li h1 h2 h3 h4 h5 h6 em i strong), attributes: %w(style href id class src title width height frameborder allow allowfullscreen alt loading data-action data-target data-hide-on-close data-toggle-content data-modal data-role data-url data-gallery controls))
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
