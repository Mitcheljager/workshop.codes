class SearchController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    unless params[:query].empty?
      respond_to do |format|
        format.js { redirect_to build_filter_path(:search, params[:query].gsub(".", "")) }
        format.html { redirect_to build_filter_path(:search, params[:query].gsub(".", "")) }
      end
    else
      redirect_back fallback_location: root_path
    end
  end

  def show
    if params.keys.without("controller", "action", "default").length == 0
      redirect_to root_path
      return
    end
    track_action
    begin
      @posts = get_filtered_posts(params)
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
      format.html { render "filter/index" }
      format.js { render "posts/infinite_scroll_posts" }
      format.json {
        set_request_headers
        render json: @posts
      }
    end
  end

  private

  def track_action
    parameters = request.path_parameters
    parameters[:search] = params[:search]

    TrackingJob.perform_async(ahoy, "Search", parameters)
  end

  # @raise [Elasticsearch::Transport::Transport::ServerError] if backend
  #   ElasticSearch cluster has an issue
  def get_filtered_posts(params)
    if params[:search]
      ids = Post.search(params[:search])
      posts = Post.includes(:user)
                   .where(id: ids)
                   .order_by_ids(ids)
                   .select_overview_columns.public?
    else
      posts = Post.select_overview_columns.public?
    end

    user = User.find_by_username(params[:author]) if params[:author]
    posts = posts.where(user_id: @user.present? ? @user.id : -1) if params[:author]

    posts = posts.where(locale: params[:language]) if params[:language]
    posts = posts.where("created_at >= ?", params[:from]) if params[:from]
    posts = posts.where("created_at <= ?", params[:to]) if params[:to]
    posts = posts.where("last_revision_created_at > ?", 6.months.ago) if params[:expired]
    posts = posts.where("overwatch_2_compatible", true) if params[:overwatch_2]

    posts = posts.order("#{ sort_switch } DESC") if params[:sort]

    posts = posts.select { |post| to_slug(post.categories).include?(to_slug(params[:category])) } if params[:category]
    posts = posts.select { |post| to_slug(post.maps).include?(to_slug(params[:map])) } if params[:map]
    posts = posts.select { |post| to_slug(post.heroes).include?(to_slug(params[:hero])) } if params[:hero]
    posts = posts.select { |post| helpers.has_player_range?(post) && to_range(params[:players]).overlaps?((post.min_players)..(post.max_players)) } if params[:players]
    posts = posts.select { |post| post.code.upcase.start_with?(params[:code].upcase) } if params[:code]

    posts = Kaminari.paginate_array(posts).page(params[:page])
  end

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
