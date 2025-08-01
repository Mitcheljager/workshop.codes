module UsersHelper
  def is_arbiter?(user)
    if user && (user.level == "admin" || user.level == "arbiter")
      true
    else
      false
    end
  end

  def is_admin?(user)
    true if user && user.level == "admin"
  end

  def is_banned?(user)
    true if user && user.level == "banned"
  end

  def to_clean_username(username)
    username.split("#")[0]
  end
end
