class FilterController < ApplicationController
  def index
    # REFACTOR: Make this set of attributes have a single source of accessible truth
    redirect_to filter_path(params.permit([:category, :hero, :map, :from, :to, :sort, :expired, :author, :players, :language, :search, :default, :page])), status: :moved_permanently
  end

  def get_verified_users
    @verified_users = User.where(verified: true).order(username: :asc).includes(:posts).with_attached_profile_image

    render layout: false
  end
end
