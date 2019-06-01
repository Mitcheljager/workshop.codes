module ApplicationHelper
  def markdown(text)
    options = {
      escape_html: true,
      link_attributes: { target: "_blank" },
      space_after_headers: true,
      fenced_code_blocks: true
    }

    renderer = Redcarpet::Render::HTML.new(options)
    markdown = Redcarpet::Markdown.new(renderer)

    markdown.render(text).html_safe
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
end
