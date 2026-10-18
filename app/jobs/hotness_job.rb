class HotnessJob
  include SuckerPunch::Job
  include BadgesHelper

  def perform(post)
    begin
      return if post.blank?
      return if post.hotness_last_updated_at.present? && post.hotness_last_updated_at > 1.hour.ago

      ActiveRecord::Base.connection_pool.with_connection do
        # Copied from rake task hotness:set_hotness_for_posts.
        # If things work out, this job will replace that task.

        favorites_count = Favorite.where(post_id: post.id).where("created_at > ?", 1.week.ago).count
        impressions_count = Ahoy::Event.where(model_id: post.id, name: "Posts Visit").where("time > ?", 1.day.ago).distinct.count(:visit_id)
        copy_count = Ahoy::Event.where(model_id: post.id, name: "Copy Code").where("time > ?", 1.day.ago).distinct.count(:visit_id)

        days_old = (post.last_revision_created_at.to_datetime...Time.now).count
        days_old = [[days_old, 3].max, 45].min

        impressions_and_copy_score = impressions_count + (copy_count * 5)
        favorites_score = favorites_count * 20
        total_score = [[impressions_and_copy_score + favorites_score, 1].max / (days_old / 3), 1].max.round

        if total_score >= 1000
          create_badge(badge_id: 3, user: post.user)
        end

        post.update_column(:hotness, total_score)

        if total_score > post.top_hotness
          post.update_columns(top_hotness: total_score, top_hotness_at: DateTime.now)
        end

        post.update_column(:hotness_last_updated_at, DateTime.now)
      end
    rescue => error
      Rails.logger.error(error)
    end
  end
end
