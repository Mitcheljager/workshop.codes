class SearchController < ApplicationController
  skip_before_action :verify_authenticity_token

  before_action :redirect_invalid_params

  def index
    # Handle old uses of search instead of query as the name
    if search_params[:search].present?
      search_params[:query] = search_params.delete(:search) unless search_params[:query].present?
    end

    unless search_params[:query].blank?
      respond_to do |format|
        format.js { redirect_to build_filter_path(:search, search_params[:query]) }
        format.html { redirect_to build_filter_path(:search, search_params[:query]) }
      end
    else
      redirect_back fallback_location: latest_path
    end
  end

  def redirect_to_query_params
    if search_params[:query].blank?
      redirect_back fallback_location: latest_path
      return
    end

    respond_to do |format|
      format.js { redirect_to build_filter_path(:search, search_params[:query]), status: :moved_permanently }
      format.html { redirect_to build_filter_path(:search, search_params[:query]), status: :moved_permanently }
    end
  end

  def show
    if params.keys.without("controller", "action", "default").length == 0
      redirect_to latest_path
      return
    end

    begin
      @posts = get_filtered_posts
      @users = get_search_users
    rescue Elasticsearch::Transport::Transport::ServerError => e
      Bugsnag.notify(e) if Rails.env.production?

      @posts = Kaminari.paginate_array([]).page(search_params[:page])
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

  # @raise [Elasticsearch::Transport::Transport::ServerError] if backend ElasticSearch cluster has an issue
  def get_filtered_posts
    posts = Post.includes(:user).select_overview_columns.public?

    if search_params[:search].present? && ENV["BONSAI_URL"]
      query = search_params[:search]
      ids = Rails.cache.fetch("search_ids/#{query}", expires_in: 12.hours) { Post.search(query) }
      posts = posts.where(id: ids).order_by_ids(ids)
    end

    posts = posts.joins(:user).where(users: { username: search_params[:author] }) if search_params[:author].present?
    posts = posts.where([to_slug_query("categories"), "%#{to_slug(search_params[:category])}%"]) if search_params[:category].present?
    posts = posts.where([to_slug_query("maps"), "%#{to_slug(search_params[:map])}%"]) if search_params[:map].present?
    posts = posts.where([to_slug_query("heroes"), "%#{to_slug(search_params[:hero])}%"]) if search_params[:hero].present?

    if search_params[:players].present?
      range = to_range(search_params[:players])
      posts = posts.where("min_players <= ? AND max_players >= ?", range.end, range.begin)
    end

    posts = posts.where("UPPER(code) LIKE ?", "#{search_params[:code].upcase}%") if search_params[:code].present?
    posts = posts.order("#{sort_switch} DESC") if search_params[:sort].present?
    posts = posts.page(search_params[:page])
  end

  def get_search_users
    return if search_params[:search].blank?
    return if search_params[:category] || search_params[:map] || search_params[:hero] || search_params[:players] || search_params[:code]

    if ENV["BONSAI_URL"]
      ids = Rails.cache.fetch("user_search_#{search_params[:search]}", expires_in: 1.day) do
        User.search(search_params[:search])
      end

      users = User.where(id: ids).order_by_ids(ids)
    else
      users = User.limit(3)
    end

    users = users.includes(:badges)
                 .with_at_least_one_post
                 .where(linked_id: nil) # Is not a linked account
                 .where.not(level: :banned) # Not banned
                 .limit(3)
  end

  def sort_switch
    case search_params[:sort]
    when "views"
      "impressions_count"
    when "favorites"
      "favorites_count"
    when "created"
      "created_at"
    when "updated"
      "last_revision_created_at"
    when "on-fire"
      "hotness"
    else
      "created_at"
    end
  end

  def search_params
    params.permit(:category, :code, :hero, :map, :sort, :expired, :author, :players, :search, :query, :page)
  end

  def redirect_invalid_params
    redirect_to filter_path(search_params) if string_params(params) != params
  end
end
