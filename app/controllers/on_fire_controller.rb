class OnFireController < ApplicationController
  def index
    @posts = Post.includes(:user).select_overview_columns.public?.where("hotness > 1").order("hotness DESC").page(params[:page])

    respond_to do |format|
      format.html
      format.js { render "posts/infinite_scroll_posts" }
      format.json {
        set_request_headers
        render json: @posts
      }
    end
  end
end
