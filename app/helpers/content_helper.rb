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

    content = markdown.render(text).html_safe
  end

  def markdown_youtube(text)
    text.gsub /\[youtube\s+(.*?)\]/ do
      "<div class='video'>
        <iframe class='video__iframe' loading='lazy' width='560' height='315' src='https://www.youtube-nocookie.com/embed/#{$1}' frameborder='0' allowfullscreen></iframe>
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

  def sanitized_markdown(text)
    ActionController::Base.helpers.sanitize(markdown(text), tags: %w(div span hr style mark dl dd dt img details summary a b iframe audio source blockquote pre code br p table td tr th thead tbody ul ol li h1 h2 h3 h4 h5 h6 em i strong), attributes: %w(style href id class src title width height frameborder allow allowfullscreen alt loading data-action data-target data-hide-on-close data-toggle-content data-modal data-role data-url data-gallery controls))
  end
end
