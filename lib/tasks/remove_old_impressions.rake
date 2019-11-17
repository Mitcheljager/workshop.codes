desc "Remove 3 day old impressions for posts"
task :remove_old_impressions => :environment do
  impressions = Impression.where("created_at < ?", 3.days.ago)
  impressions.destroy_all
end
