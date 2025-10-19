require "base64"

module ImagesHelper
  def svg_data_uri(file)
    path = Rails.root.join("app", "assets", "images", file)

    raise "SVG not found: #{path}" unless File.exist?(path)

    svg_data = File.read(path)
    base64_svg = Base64.strict_encode64(svg_data)

    "data:image/svg+xml;base64,#{base64_svg}"
  end
end
