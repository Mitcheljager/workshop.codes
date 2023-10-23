class FilterController < ApplicationController
  def index
    # REFACTOR: Make this set of attributes have a single source of accessible truth
    filtered_params = params.permit([:category, :code, :hero, :map, :from, :to, :sort, :expired, :author, :players, :language, :search, :page])
    respond_to do |format|
      format.html   { redirect_to filter_path(filtered_params), status: :moved_permanently }
      format.js     { head :moved_permanently, location: filter_path(params: filtered_params, format: :js) }
      format.json   { head :moved_permanently, location: filter_path(params: filtered_params, format: :json) }
    end
  end

  def get_verified_users
    @verified_users = User.where(verified: true).order(username: :asc).includes(:posts).with_attached_profile_image

    render layout: false
  end

  def partial
    render partial: "filter/filter_content"
  end
end
