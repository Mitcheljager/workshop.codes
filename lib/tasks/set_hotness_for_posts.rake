desc "Set hotness for each post"
task :set_hotness_for_posts => :environment do
  Post.all.each do |post|
    favorites_count = Favorite.where(post_id: post.id).where("created_at > ?", 1.week.ago).count
    impressions_count = Ahoy::Event.where(name: "Post Visit").where(properties: { post_id: post.id }).count
    days_old = [(post.updated_at.to_datetime...Time.now).count, 1].max

    post.hotness = ([favorites_count * 10 + impressions_count, 1].max) / ([days_old / 2, 1].max)

    post.save(touch: false)
  end
end
