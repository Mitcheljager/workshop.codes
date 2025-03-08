class SearchController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    # Handle old uses of search instead of query as the name
    if params[:search].present?
       params[:query] = params.delete(:search) unless params[:query].present?
    end

    unless params[:query].blank?
      respond_to do |format|
        format.js { redirect_to build_filter_path(:search, params[:query]) }
        format.html { redirect_to build_filter_path(:search, params[:query]) }
      end
    else
      redirect_back fallback_location: latest_path
    end
  end

  def redirect_to_query_params
    if params[:query].blank?
      redirect_back fallback_location: latest_path
      return
    end

    respond_to do |format|
      format.js { redirect_to build_filter_path(:search, params[:query]), status: :moved_permanently }
      format.html { redirect_to build_filter_path(:search, params[:query]), status: :moved_permanently }
    end
  end

  def show
    if params.keys.without("controller", "action", "default").length == 0
      redirect_to latest_path
      return
    end

    if (params[:page].present? && Integer(params[:page]) > 10)
      @posts = []
      return
    end

    begin
      @posts = get_filtered_posts(params)
      @users = get_search_users(params)
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

  # @raise [Elasticsearch::Transport::Transport::ServerError] if backend
  #   ElasticSearch cluster has an issue
  def get_filtered_posts(params)
    if params[:search].present? && ENV["BONSAI_URL"]
      ids = Post.search(params[:search])

      posts = Post.includes(:user)
                   .where(id: ids)
                   .order_by_ids(ids)
                   .select_overview_columns.public?
    else
      posts = Post.select_overview_columns.public?
    end

    if params[:author]
      user = User.find_by_username(params[:author])
      posts = posts.where(user_id: user.present? ? user.id : -1)
    end

    posts = posts.order("#{ sort_switch } DESC") if params[:sort]

    posts = posts.select { |post| to_slug(post.categories).include?(to_slug(params[:category])) } if params[:category]
    posts = posts.select { |post| to_slug(post.maps).include?(to_slug(params[:map])) } if params[:map]
    posts = posts.select { |post| to_slug(post.heroes).include?(to_slug(params[:hero])) } if params[:hero]
    posts = posts.select { |post| helpers.has_player_range?(post) && to_range(params[:players]).overlaps?((post.min_players)..(post.max_players)) } if params[:players]
    posts = posts.select { |post| post.code.upcase.start_with?(params[:code].upcase) } if params[:code]

    posts = Kaminari.paginate_array(posts).page(params[:page])
  end

  def get_search_users(params)
    return if params[:search].blank?
    return if params[:category] || params[:map] || params[:hero] || params[:players] || params[:code]

    if ENV["BONSAI_URL"]
      ids = Rails.cache.fetch("user_search_#{params[:search]}", expires_in: 1.day) do
        User.search(params[:search])
      end

      users = User.where(id: ids).order_by_ids(ids)
    else
      users = User.limit(3)
    end

    users = users.includes(:badges)
                 .where(linked_id: nil) # Is not a linked account
                 .where.not(level: :banned) # Not banned
                 .where("EXISTS (SELECT 1 FROM posts WHERE posts.user_id = users.id)") # Has any posts
                 .limit(3)
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
      "last_revision_created_at"
    when "on-fire"
      "hotness"
    else
      "created_at"
    end
  end
end
