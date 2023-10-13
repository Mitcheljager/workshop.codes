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

  def asset_exists?(path)
    return unless path.present?

    if assets = Rails.application.assets
      asset = assets.find_asset(path)
      return asset.present?
    else
      public_file_path = File.join(Rails.root, "public", path)
      return File.exist?(public_file_path)
    end
  end

  def inline_js(path)
    "<script>#{ inline_file path }</script>".html_safe
  end

  def inline_css(path)
    "<style>#{ inline_file path }</style>".html_safe
  end
end
