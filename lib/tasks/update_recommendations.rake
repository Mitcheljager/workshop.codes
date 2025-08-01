desc "Update post recommendations for users"
task update_recommendations: :environment do
  data = Favorite.all.map do |favorite|
    { user_id: favorite.user_id, item_id: favorite.post_id }
  end

  recommender = Disco::Recommender.new()
  recommender.fit(data)

  User.find_each do |user|
    recommendations = recommender.user_recs(user.id, count: 3)
    user.update_recommended_posts(recommendations)
  end

  Post.find_each do |post|
    recommendations = recommender.item_recs(post.id, count: 3)
    post.update_recommended_posts(recommendations)
  end
end
