module ProfilesHelper
  def user_profile_path(user, sort = nil)
    if user.verified? && user.nice_url.present?
      profile_path(user.nice_url, sort_posts: sort)
    else
      profile_path(user.username, sort_posts: sort)
    end
  end
end
