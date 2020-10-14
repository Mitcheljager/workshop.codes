desc "Compress 1 day old impressions in to Statistic"
task :compress_impressions => :environment do
  compress_events("Posts Visit", :visit)
  compress_events("Copy Code", :copy)
  compress_events("Listing", :listing)
  compress_search_terms
  compress_visits

  Ahoy::Visit.where("started_at < ?", 2.weeks.ago).find_in_batches do |visits|
    visit_ids = visits.map(&:id)
    Ahoy::Event.where(visit_id: visit_ids).delete_all
    Ahoy::Visit.where(id: visit_ids).delete_all
  end
end

def compress_events(event_name, content_type)
  events = Ahoy::Event.where("time > ?", 1.day.ago).where(name: event_name).distinct.pluck(:visit_id, :properties).group_by { |v| v[1]["id"] }

  events.each do |event|
    @statistic = Statistic.new(timeframe: :daily, content_type: content_type, on_date: Date.today, value: event[1].size, properties: event[1].first[1])

    if event[1].first[1]["id"]
      @statistic.model_id = event[1].first[1]["id"]

      post = Post.find_by_id(event[1].first[1]["id"])
      post.increment!(:impressions_count, event[1].size) if post.present? && content_type == :visit
      post.increment!(:listings_count, event[1].size) if post.present? && content_type == :listing
    end

    @statistic.save
  end
end

def compress_search_terms
  events = Ahoy::Event.where("time > ?", 1.day.ago).where(name: "Search").distinct.pluck(:visit_id, :properties).group_by { |v| v[1] }

  events.each do |event|
    next unless event[1].first[1]["search"].present?

    search_term = event[1].first[1]["search"].downcase

    @statistic = Statistic.find_by_properties(search_term)
    if @statistic.present?
      @statistic.value = @statistic.value + event[1].size
    else
      @statistic = Statistic.new(timeframe: :forever, content_type: :search, value: event[1].size, properties: search_term)
    end

    @statistic.save
  end
end

def compress_visits
  visits = Ahoy::Visit.where("started_at > ?", 1.day.ago)

  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_visit, on_date: Date.today, value: visits.size)
  @statistic.save
end
