class Api::AbilitiesController < Api::BaseController
  include ActionView::Helpers::AssetUrlHelper

  def index
    if params[:name]
      slug = ability_name_to_slug(params[:name])

      ability = abilities.find { |ability| slug == ability_name_to_slug(ability[:name]) }

      render_404 and return if ability.blank?

      render json: ability and return
    end

    if params[:tag]
      slug = ability_name_to_slug(params[:tag])

      filtered_abilities = abilities.select { |ability|
        ability[:tags].filter { |tag| ability_name_to_slug(tag) == slug }.present?
      }

      render json: filtered_abilities and return
    end

    render json: abilities
  end

  private

  def abilities
    abilities_array = YAML.safe_load(File.read(Rails.root.join("config/arrays", "abilities.yml"))).inject(:merge)

    abilities = abilities_array.map do |name, tags|
      ability = {}

      ability[:name] = name
      ability[:tags] = tags
      ability[:icon] = {
        small: ActionController::Base.helpers.vite_asset_url(ability_name_to_icon_url(name)),
        large: ActionController::Base.helpers.vite_asset_url(ability_name_to_icon_url(name, 128))
      }

      ability
    end

    abilities
  end
end
