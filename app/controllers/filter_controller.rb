class FilterController < ApplicationController
  def index
    begin
      if params[:search]
        ids = Post.search(params[:search])
        @posts = Post.includes(:user)
                     .where(id: ids)
                     .order_by_ids(ids)
                     .select_overview_columns.public?
      else
        @posts = Post.select_overview_columns.public?
      end

      @user = User.find_by_username(params[:author]) if params[:author]
      @posts = @posts.where(user_id: @user.present? ? @user.id : -1) if params[:author]

      @posts = @posts.where(locale: params[:language]) if params[:language]
      @posts = @posts.where("created_at >= ?", params[:from]) if params[:from]
      @posts = @posts.where("created_at <= ?", params[:to]) if params[:to]
      @posts = @posts.where("last_revision_created_at > ?", 6.months.ago) if params[:expired]
      @posts = @posts.where("overwatch_2_compatible", true) if params[:overwatch_2]

      @posts = @posts.order("#{ sort_switch } DESC") if params[:sort]

      @posts = @posts.select { |post| to_slug(post.categories).include?(to_slug(params[:category])) } if params[:category]
      @posts = @posts.select { |post| to_slug(post.maps).include?(to_slug(params[:map])) } if params[:map]
      @posts = @posts.select { |post| to_slug(post.heroes).include?(to_slug(params[:hero])) } if params[:hero]
      @posts = @posts.select { |post| helpers.has_player_range?(post) && to_range(params[:players]).overlaps?((post.min_players)..(post.max_players)) } if params[:players]
      @posts = @posts.select { |post| post.code.upcase.start_with?(params[:code].upcase) } if params[:code]

      @posts = Kaminari.paginate_array(@posts).page(params[:page])
    rescue Elasticsearch::Transport::Transport::ServerError => e
      Bugsnag.notify(e) if Rails.env.production?
      @posts = Kaminari.paginate_array([]).page(params[:page])
      @error = "Something went wrong. Please try again later."
      flash[:error] = @error
      respond_to do |format|
        format.html { render "filter/index", status: 500 }
        format.js { render "posts/infinite_scroll_posts", status: 500 }
        format.json { render json: { message: @message }, status: 500 }
      end
      return
    end

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
end
