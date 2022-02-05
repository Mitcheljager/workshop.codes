namespace :hotness do
  desc "Set hotness for each post"

  task :set_hotness_for_posts => :environment do
    include BadgesHelper

    ActiveRecord::Base.connection_pool.with_connection do
      Post.where("last_revision_created_at > ?", 2.months.ago).or(Post.where("hotness > ?", 50)).all.each do |post|
        favorites_count = Favorite.where(post_id: post.id).where("created_at > ?", 1.week.ago).count
        impressions_count = Ahoy::Event.where(name: "Posts Visit").where("time > ?", 1.day.ago).distinct.pluck(:visit_id, :properties).select { |s| s[1]["controller"] == "posts" && s[1]["action"] == "show" && s[1]["id"] == post.id }.count
        copy_count = Ahoy::Event.where(name: "Copy Code").where("time > ?", 1.day.ago).distinct.pluck(:visit_id, :properties).select { |s| s[1]["id"] == post.id }.count

        days_old = (post.last_revision_created_at.to_datetime...Time.now).count
        days_old = [[days_old, 1].max, 15].min

        post.hotness = [(([impressions_count + (copy_count * 2), 1].max) / ([days_old / 2, 1].max)) + (favorites_count * 20 / [days_old / 4, 1].max), 1].max

        if post.hotness >= 1000
          create_badge(badge_id: 3, user: post.user)
        end

        post.save(touch: false)
      end
    end
  end
end
