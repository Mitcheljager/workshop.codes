class FeedController < ApplicationController
  before_action do
    redirect_to root_path unless current_user
  end

  after_action do
    current_user.update(feed_last_visited_at: DateTime.now)
  end

  def index
    @feed_last_visited_at = current_user.feed_last_visited_at
    @marker_shown = false

    @favorite_ids = current_user.favorites.pluck(:post_id)
    @revisions = Revision.includes(:post).where(visible: true, post_id: @favorite_ids).order(created_at: :desc).page(params[:page])

    respond_to do |format|
      format.html
      format.js { render "feed/infinite_scroll_feed_items" }
    end
  end
end
