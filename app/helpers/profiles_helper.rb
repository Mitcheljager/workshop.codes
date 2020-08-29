module ProfilesHelper
  def user_profile_path(user)
    if user.verified? && user.nice_url.present?
      profile_show_path(user.nice_url)
    else
      profile_show_path(user.username)
    end
  end
end
