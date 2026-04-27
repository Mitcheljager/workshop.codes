class Api::MapsController < Api::BaseController
  include ActionView::Helpers::AssetUrlHelper

  def index
    render json: maps
  end

  def show
    map = maps.find { |map| map["name"] == params[:name] || map["slug"] == params[:name] }

    render_404 and return if map.blank?

    render json: map
  end

  private

  def maps
    maps = YAML.safe_load(File.read(Rails.root.join("config/arrays", "maps.yml")))

    maps.map do |map|
      map[:thumbnail] = {
        small: ActionController::Base.helpers.vite_asset_url("images/maps/small/#{ map["slug"] }.jpg"),
        medium: ActionController::Base.helpers.vite_asset_url("images/maps/medium/#{ map["slug"] }.jpg"),
        large: ActionController::Base.helpers.vite_asset_url("images/maps/large/#{ map["slug"] }.jpg")
      }
    end

    maps
  end
end
