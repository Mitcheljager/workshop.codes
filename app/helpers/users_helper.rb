module UsersHelper
  def get_username_for_claimed_profile_uid(uid)
    profile = ClaimedProfile.find_by_profile_uid_and_checks_completed(uid, 1)

    if profile.present?
      return profile.username
    end
  end
end
