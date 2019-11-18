module AssetsHelper
  def inline_file(path)
    if assets = Rails.application.assets
      asset = assets.find_asset(path)
      return "" unless asset
      asset.source
    else
      File.read(File.join(Rails.root, "public", asset_path(path)))
    end
  end

  def inline_js(path)
    raw "<script>#{ inline_file path }</script>".gsub(/[\u0080-\u00ff]/, "")
  end

  def inline_css(path)
    raw "<style>#{ inline_file path }</style>".gsub(/[\u0080-\u00ff]/, "")
  end
end
