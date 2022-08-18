desc "Update post recommendations for users"
task :update_recommendations => :environment do
  data = Favorite.all.map do |favorite|
    { user_id: favorite.user_id, item_id: favorite.post_id }
  end

  recommender = Disco::Recommender.new()
  recommender.fit(data)

  User.find_each do |user|
    recommendations = recommender.user_recs(user.id)
    user.update_recommended_posts(recommendations)
  end
end
