class BadgesFavoritesJob
  include SuckerPunch::Job
  include BadgesHelper

  def perform(post, user)
    begin
      return unless post.present?
      return unless user.present?

      ActiveRecord::Base.connection_pool.with_connection do
        post_user = post.user
        post_ids = post_user.posts.pluck(:id)
        favorites_count = Favorite.where(post_id: post_ids).count

        create_badge(badge_id: 0, user: post_user) if favorites_count >= 100
        create_badge(badge_id: 1, user: post_user) if favorites_count >= 500

        create_badge(badge_id: 5, user: user) if user.favorites.count >= 50
      end
    rescue
    end
  end
end
