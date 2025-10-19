module ApplicationHelper
  def non_www_url
    url = request.original_url
    url.gsub("www.", "")
  end

  def is_wiki?
    controller_path.split("/").first == "wiki" ? true : false
  end

  def is_blog?
    controller_path.split("/").first == "articles" ? true : false
  end

  def is_editor?
    controller_path.split("/").first == "editor" ? true : false
  end

  def is_admin_controller?
    controller_path.split("/").first == "admin" ? true : false
  end

  def to_slug(string)
    string.to_s.downcase.gsub(" ", "-").gsub(":", "").gsub(".", "").gsub("'", "").gsub("/", "")
  end

  def to_slug_query(column)
    if ActiveRecord::Base.connection.adapter_name.downcase.include?("sqlite")
      # SQLite
      "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(#{column}, ' ', '-'), ':', ''), '.', ''), '''', ''), '/', '')) LIKE ?"
    else
      # PostgreSQL
      "LOWER(REGEXP_REPLACE(REGEXP_REPLACE(#{column}, ' ', '-', 'g'), '[ :.''/]', '', 'g')) LIKE ?"
    end
  end

  def to_search_query(string)
    CGI.escape(string.to_s.downcase).gsub(".", "%2E")
  end

  def to_range(string)
    Range.new(*string.split("-").map(&:to_i))
  end

  def slug_to_word(string)
    string.gsub("-", " ").split.map(&:capitalize).join(" ")
  end

  def maps
    YAML.safe_load(File.read(Rails.root.join("config/arrays", "maps.yml")))
  end

  def heroes
    YAML.safe_load(File.read(Rails.root.join("config/arrays", "heroes.yml")))
  end

  def categories
    YAML.safe_load(File.read(Rails.root.join("config/arrays", "categories.yml")))
  end

  def quotes
    YAML.safe_load(File.read(Rails.root.join("config/arrays", "quotes.yml")))
  end

  def badges
    YAML.safe_load(File.read(Rails.root.join("config/arrays", "badges.yml")))
  end

  def abilities
    YAML.safe_load(File.read(Rails.root.join("config/arrays", "abilities.yml")))
  end

  def user_menu_items
    [
      { title: "Overview", url: account_path, data: { prefetch: false } },
      { title: "Update Feed", url: feed_index_path, data: { prefetch: false } },
      { title: "Notifications", url: notifications_path },
      { title: "Favorites", url: account_favorites_path },
      { title: "Codes", url: account_posts_path },
      { title: "Collections", url: account_collections_path },
      { title: "Profile", url: edit_profile_path },
      { title: "Account", url: edit_user_path },
      { title: "Linked Accounts", url: linked_users_path },
      { title: "Logout", url: logout_path, data: { prefetch: false } }
    ]
  end

  def clean_up_session_auth
    session.delete "oauth_provider"
    session.delete "oauth_uid"
    session.delete "oauth_expires_at"
  end
end
