desc "Compress 1 day old impressions in to Statistic"
task :compress_impressions => :environment do
  events = Ahoy::Event.where("time > ?", 1.day.ago).group_by { |v| v.properties["post_id"] }

  events.each do |event|
    Statistic.create(timeframe: :daily, on_date: Date.today, concerns_id: event[0], value: event[1].size)
  end

  visits = Ahoy::Visit.where("started_at < ?", 1.week.ago)
  events = Ahoy::Event.where("time < ?", 1.week.ago)

  events.destroy_all
  visits.destroy_all
end
