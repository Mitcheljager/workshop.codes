desc "Set hotness for each post"
task :set_hotness_for_posts => :environment do
  Post.all.each do |post|
    favorites_count = Favorite.where(post_id: post.id).where("created_at > ?", 1.week.ago).count
    impressions_count = Ahoy::Event.where(name: "Posts Visit").where("time > ?", 1.week.ago).distinct.pluck(:visit_id, :properties).select { |s| s[1]["controller"] == "posts" && s[1]["action"] == "show" && s[1]["id"] == post.id }.count
    copy_count = Ahoy::Event.where(name: "Copy Code").where("time > ?", 1.week.ago).distinct.pluck(:visit_id, :properties).select { |s| s[1]["id"] == post.id }.count
    days_old = [(post.updated_at.to_datetime...Time.now).count, 1].max

    post.hotness = ([favorites_count * 10 + impressions_count + copy_count, 1].max) / ([days_old / 2, 1].max)

    post.save(touch: false)
  end
end
