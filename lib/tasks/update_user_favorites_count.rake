task update_user_favorites_count: :environment do
  User.all.each do |user|
    User.reset_counters(user.id, :favorites)
  end
end
