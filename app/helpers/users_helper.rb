module UsersHelper
  def accessibility_settings
    "#{ "high-contrast" if current_user.high_contrast? } #{ "large-fonts" if current_user.large_fonts? }"
  end

  def is_arbiter?(user)
    if user && (user.level == "admin" || user.level == "arbiter")
      return true
    else
      return false
    end
  end

  def is_admin?(user)
    return true if user && user.level == "admin"
  end

  def is_banned?(user)
    return true if user && user.level == "banned"
  end
end
