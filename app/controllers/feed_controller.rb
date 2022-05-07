class FeedController < ApplicationController
  before_action do
    redirect_to root_path unless current_user
  end

  def index
    @favorite_ids = current_user.favorites.pluck(:post_id)
    @revisions = Revision.where(post_id: @favorite_ids).order(created_at: :desc)
  end
end
