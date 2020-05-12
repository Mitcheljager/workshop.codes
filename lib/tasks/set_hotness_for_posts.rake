desc "Set hotness for each post"
task :set_hotness_for_posts => :environment do
  Post.where("updated_at > ?", 2.month.ago).all.each do |post|
    favorites_count = Favorite.where(post_id: post.id).where("created_at > ?", 1.week.ago).count
    impressions_count = Ahoy::Event.where(name: "Posts Visit").where("time > ?", 1.day.ago).distinct.pluck(:visit_id, :properties).select { |s| s[1]["controller"] == "posts" && s[1]["action"] == "show" && s[1]["id"] == post.id }.count
    copy_count = Ahoy::Event.where(name: "Copy Code").where("time > ?", 1.day.ago).distinct.pluck(:visit_id, :properties).select { |s| s[1]["id"] == post.id }.count
    statistics_count = Statistic.where(model_id: post.id).where("on_date > ?", 1.week.ago).count

    if post.revisions.any?
      days_old = (post.revisions.last.created_at.to_datetime...Time.now).count
    else
      days_old = (post.updated_at.to_datetime...Time.now).count
    end
    days_old = [days_old, 1].max

    post.hotness = (([impressions_count + copy_count + statistics_count, 1].max) / ([days_old / 2, 1].max)) + (favorites_count * 20 / [days_old / 4, 1].max)

    post.save(touch: false)
  end
end
