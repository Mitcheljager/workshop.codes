module ProfilesHelper
  def user_profile_path(user, sort = nil)
    if user.verified? && user.nice_url.present?
      profile_show_path(user.nice_url, user_sort: sort)
    else
      profile_show_path(user.username, user_sort: sort)
    end
  end
end
