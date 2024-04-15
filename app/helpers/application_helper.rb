module ApplicationHelper
  def build_filter_path(key, value)
    parameters = {
      category: params[:category],
      hero: params[:hero],
      map: params[:map],
      from: params[:from],
      to: params[:to],
      sort: params[:sort],
      expired: params[:expired],
      author: params[:author],
      players: params[:players],
      language: params[:language],
      search: params[:search]
    }

    parameters[key] = value

    if parameters.values.all? { |v| v.nil? }
      return filter_path(sort: :latest)
    else
      return filter_path(parameters)
    end
  end

  def non_www_url
    url = request.original_url
    url.gsub("www.", "")
  end

  def is_wiki?
    controller_path.split('/').first == "wiki" ? true : false
  end

  def is_admin_controller?
    controller_path.split('/').first == "admin" ? true : false
  end

  def to_slug(string)
    string.to_s.downcase.gsub(" ", "-").gsub(":", "").gsub(".", "").gsub("'", "").gsub("/", "")
  end

  def to_search_query(string)
    CGI.escape(string.to_s.downcase).gsub(".", "%2E")
  end

  def to_range(string)
    Range.new(*string.split("-").map(&:to_i))
  end

  def maps
    YAML.load(File.read(Rails.root.join("config/arrays", "maps.yml")))
  end

  def heroes
    YAML.load(File.read(Rails.root.join("config/arrays", "heroes.yml")))
  end

  def categories
    YAML.load(File.read(Rails.root.join("config/arrays", "categories.yml")))
  end

  def quotes
    YAML.load(File.read(Rails.root.join("config/arrays", "quotes.yml")))
  end

  def badges
    YAML.load(File.read(Rails.root.join("config/arrays", "badges.yml")))
  end

  def abilities
    YAML.load(File.read(Rails.root.join("config/arrays", "abilities.yml")))
  end

  def user_menu_items
    [
      { title: "Overview", url: account_path, data: { prefetch: false } },
      { title: "Update Feed", url: feed_index_path, data: { prefetch: false } },
      { title: "Notifications", url: notifications_path, },
      { title: "Favorites", url: account_favorites_path, },
      { title: "Codes", url: account_posts_path, },
      { title: "Collections", url: account_collections_path, },
      { title: "Profile", url: edit_profile_path, },
      { title: "Account", url: edit_user_path, },
      { title: "Linked Accounts", url: linked_users_path, },
      { title: "Logout", url: logout_path, data: { prefetch: false } }
    ]
  end

  def clean_up_session_auth
    session.delete "oauth_provider"
    session.delete "oauth_uid"
    session.delete "oauth_expires_at"
  end
end
