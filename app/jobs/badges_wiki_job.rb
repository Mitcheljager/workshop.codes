class BadgesWikiJob
  include SuckerPunch::Job
  include BadgesHelper

  def perform(user)
    begin
      return unless user.present?

      ActiveRecord::Base.connection_pool.with_connection do
        create_badge(badge_id: 8, user: user)
      end
    rescue
    end
  end
end
