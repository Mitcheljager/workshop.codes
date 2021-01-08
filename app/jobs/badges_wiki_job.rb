class BadgesWikiJob
  include SuckerPunch::Job
  include BadgesHelper

  def perform(user)
    return unless user.present?

    create_badge(badge_id: 8, user: user)
  end
end
