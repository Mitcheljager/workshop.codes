desc "Compress 1 day old impressions in to Statistic"
task :compress_impressions => :environment do
  compress_events("Posts Visit", :visit)
  compress_events("Copy Code", :copy)
  compress_visits

  visits = Ahoy::Visit.where("started_at < ?", 1.week.ago)
  events = Ahoy::Event.where("time < ?", 1.week.ago)

  events.destroy_all
  visits.destroy_all
end

def compress_events(event_name, content_type)
  events = Ahoy::Event.where("time > ?", 1.day.ago).where(name: event_name).distinct.pluck(:visit_id, :properties).group_by { |v| v[1] }

  events.each do |event|
    @statistic = Statistic.new(timeframe: :daily, content_type: content_type, on_date: Date.today, value: event[1].size, properties: event[1].first[1])

    if event[1].first[1]["id"]
      @statistic.model_id = event[1].first[1]["id"]

      post = Post.find_by_id(event[1].first[1]["id"])
      post.increment!(:impressions_count, event[1].size) if post.present?
    end

    @statistic.save
  end
end

def compress_visits
  visits = Ahoy::Visit.where("started_at > ?", 1.day.ago)

  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_visit, on_date: Date.today, value: visits.size)
  @statistic.save
end
