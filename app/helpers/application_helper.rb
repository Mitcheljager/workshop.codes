module ApplicationHelper
  class HTML < Redcarpet::Render::HTML
    def block_code(code, language)
      "<pre><code class='microlight'>#{ code }</code></pre>"
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

    iframe = '<div class="video"><iframe class="video__iframe" width="560" height="315" src="https://www.youtube-nocookie.com/embed/\\1" frameborder="0" allowfullscreen></iframe></div>'

    text = text.gsub(/<script.*?>[\s\S]*<\/script>/i, "")
    text = text.gsub(/\[youtube\s+(.*?)\]/, iframe)
    content = markdown.render(text).html_safe
  end

  def sanitized_markdown(text)
    ActionController::Base.helpers.sanitize(markdown(text), tags: %w(div span hr style mark dl dd dt img details summary a b iframe blockquote pre code br p table td tr th thead tbody ul ol li h1 h2 h3 h4 h5 h6 em i strong), attributes: %w(style href id class src title width height frameborder allow allowfullscreen))
  end

  def build_filter_path(key, value)
    parameters = {
      category: params[:category],
      hero: params[:hero],
      map: params[:map],
      from: params[:from],
      to: params[:to],
      sort: params[:sort],
      expired: params[:expired],
      author: params[:author],
      search: params[:search]
    }

    parameters[key] = value

    if parameters.values.all? { |v| v.nil? }
      return root_path
    else
      return filter_path(parameters)
    end
  end

  def non_www_url
    url = request.original_url
    url.gsub("www.", "")
  end

  def is_wiki?
    controller_path.split('/').first == "wiki" ? true : false
  end

  def to_slug(string)
    string.to_s.downcase.gsub(" ", "-").gsub(":", "").gsub(".", "").gsub("'", "")
  end

  def maps
    YAML.load(File.read(Rails.root.join("config/arrays", "maps.yml")))
  end

  def heroes
    YAML.load(File.read(Rails.root.join("config/arrays", "heroes.yml")))
  end

  def categories
    YAML.load(File.read(Rails.root.join("config/arrays", "categories.yml")))
  end

  def quotes
    YAML.load(File.read(Rails.root.join("config/arrays", "quotes.yml")))
  end
end
