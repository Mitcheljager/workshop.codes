class FeedController < ApplicationController
  before_action do
    redirect_to login_path unless current_user
  end

  after_action do
    current_user.update(feed_last_visited_at: DateTime.now)
  end

  def index
    begin
      @feed_last_visited_at = current_user.feed_last_visited_at
      @marker_shown = false

      @favorite_ids = current_user.favorites.pluck(:post_id)
      @revisions = Revision.includes(:post).where(visible: true, post_id: @favorite_ids).order(created_at: :desc).page(params[:page])
    rescue => error
      Bugsnag.notify(error) if Rails.env.production?

      @error = "Something went wrong. Please try again later."
    end

    respond_to do |format|
      format.html {
        flash[:error] = @error if @error.present?
      }
      format.js {
        render "feed/infinite_scroll_feed_items"
      }
    end
  end
end
