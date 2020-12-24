class FilterController < ApplicationController
  def index
    @posts = params[:search] ? Post.includes(:user, :revisions).search(params[:search]).records.select_overview_columns.public? : Post.select_overview_columns.public?

    @user = User.find_by_username(params[:author]) if params[:author]
    @posts = @posts.where(user_id: @user.present? ? @user.id : -1) if params[:author]

    @posts = @posts.where(locale: params[:language]) if params[:language]
    @posts = @posts.where("created_at >= ?", params[:from]) if params[:from]
    @posts = @posts.where("created_at <= ?", params[:to]) if params[:to]
    @posts = @posts.where("updated_at > ?", 6.months.ago) if params[:expired]

    @posts = @posts.order("#{ sort_switch } DESC") if params[:sort]

    @posts = @posts.select { |post| to_slug(post.categories).include?(to_slug(params[:category])) } if params[:category]
    @posts = @posts.select { |post| to_slug(post.maps).include?(to_slug(params[:map])) } if params[:map]
    @posts = @posts.select { |post| to_slug(post.heroes).include?(to_slug(params[:hero])) } if params[:hero]

    @posts = Kaminari.paginate_array(@posts).page(params[:page])

    respond_to do |format|
      format.html
      format.js { render "posts/infinite_scroll_posts" }
      format.json {
        set_request_headers
        render json: @posts
      }
    end
  end

  def get_verified_users
    @verified_users = User.where(verified: true).order(username: :asc).includes(:posts).with_attached_profile_image

    render layout: false
  end

  private

  def sort_switch
    case params[:sort]
    when "views"
      "impressions_count"
    when "favorites"
      "favorites_count"
    when "created"
      "created_at"
    when "updated"
      "updated_at"
    when "on-fire"
      "hotness"
    else
      "created_at"
    end
  end

  def set_request_headers
    headers["Access-Control-Allow-Origin"] = "*"
  end
end
