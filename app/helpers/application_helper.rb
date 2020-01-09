module ApplicationHelper
  def markdown(text)
    options = {
      link_attributes: { target: "_blank" },
      space_after_headers: true,
      fenced_code_blocks: true,
      hard_wrap: true
    }

    renderer = Redcarpet::Render::HTML.new(options)
    markdown = Redcarpet::Markdown.new(renderer, highlight: true, autolink: true, lax_spacing: true)

    iframe = '<div class="video"><iframe class="video__iframe" width="560" height="315" src="https://www.youtube.com/embed/\\1" frameborder="0" allowfullscreen></iframe></div>'

    content = markdown.render(text)
    content.gsub(/\[youtube\s+(.*?)\]/, iframe).html_safe
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
      search: params[:search],
      page: params[:page]
    }

    parameters[key] = value

    if parameters.values.all? { |v| v.nil? }
      return root_path
    else
      return filter_path(parameters)
    end
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
