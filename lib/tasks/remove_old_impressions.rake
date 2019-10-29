desc "Remove week old impressions for posts"
task :remove_old_impressions => :environment do
  impressions = Impression.where("created_at < ?", 1.week.ago)
  impressions.destroy_all
end
