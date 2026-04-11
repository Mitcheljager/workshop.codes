class Api::HeroesController < Api::BaseController
  include ActionView::Helpers::AssetUrlHelper

  def index
    render json: heroes
  end

  def show
    hero = heroes.find { |hero| hero_name_to_slug(hero["name"]) === hero_name_to_slug(params[:name]) }

    render_404 and return if hero.blank?

    render json: hero
  end

  private

  def heroes
    heroes = YAML.safe_load(File.read(Rails.root.join("config/arrays", "heroes.yml")))

    heroes.map do |hero|
      hero[:portrait] = {
        "3d": {
          small: ActionController::Base.helpers.asset_url(hero_name_to_icon_url(hero["name"])),
          medium: ActionController::Base.helpers.asset_url(hero_name_to_icon_url(hero["name"], 100)),
          large: ActionController::Base.helpers.asset_url(hero_name_to_icon_url(hero["name"], 256))
        }
      }
    end

    heroes
  end
end
