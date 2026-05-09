module AssetsHelper
  def asset_exists?(path)
    return false unless path.present?

    if ViteRuby.instance.dev_server_running?
      true
    else
      ViteRuby.instance.manifest.path_for(path).present?
    end
  rescue ViteRuby::MissingEntrypointError
    false
  end
end
