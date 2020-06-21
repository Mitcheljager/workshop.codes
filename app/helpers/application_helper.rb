module ApplicationHelper
  def markdown(text)
    options = {
      space_after_headers: true,
      fenced_code_blocks: true,
      hard_wrap: true,
      link_attributes: { rel: "noreferrer noopener", target: "_blank" }
    }

    renderer = Redcarpet::Render::HTML.new(options)
    markdown = Redcarpet::Markdown.new(renderer,
      highlight: true,
      autolink: true,
      lax_spacing: true,
      tables: true
    )

    iframe = '<div class="video"><iframe class="video__iframe" width="560" height="315" src="https://www.youtube.com/embed/\\1" frameborder="0" allowfullscreen></iframe></div>'

    text = text.gsub(/<script.*?>[\s\S]*<\/script>/i, "")
    text = text.gsub(/\[youtube\s+(.*?)\]/, iframe)
    content = markdown.render(text).html_safe
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
    string.downcase.gsub(" ", "-").gsub(":", "").gsub(".", "").gsub("'", "")
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

  def last_4_digits_of_request_ip
    request.remote_ip.to_s.chars.last(4).join
  end
end
