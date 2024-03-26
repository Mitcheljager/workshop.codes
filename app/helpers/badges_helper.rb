module BadgesHelper
  include NotificationsHelper

  def create_badge(badge_id: nil, user: nil)
    return if user.badges.where(badge_id: badge_id).any?
    return unless badges.present? && badges.any?

    @badge = Badge.create(badge_id: badge_id, user_id: user.id)

    if @badge.save
      create_notification(
        "==You've earned the badge '**#{ badges[@badge.badge_id]["label"] }**'!== You can find it displayed on your profile.",
        nil,
        user.id,
        :earned_badge,
        "badge",
        @badge.id
      )
    end
  end
end
