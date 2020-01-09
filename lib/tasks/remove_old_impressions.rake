desc "Remove 3 day old impressions for posts"
task :remove_old_impressions => :environment do
  visits = Ahoy::Visit.where("started_at < ?", 1.week.ago)
  events = Ahoy::Event.where("time < ?", 1.week.ago)

  events.destroy_all
  visits.destroy_all
end
