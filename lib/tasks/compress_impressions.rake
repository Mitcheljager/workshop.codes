desc "Compress 1 day old impressions in to Statistic"
task :compress_impressions => :environment do
  ActiveRecord::Base.connection_pool.with_connection do
    compress_events("Posts Visit", :visit)
    compress_events("Copy Code", :copy)
    compress_visits

    Ahoy::Visit.where("started_at < ?", 2.weeks.ago).find_in_batches do |visits|
      visit_ids = visits.map(&:id)
      Ahoy::Event.where(visit_id: visit_ids).delete_all
      Ahoy::Visit.where(id: visit_ids).delete_all
    end
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
    end

    @statistic.save
  end
end

def compress_visits
  visits = Ahoy::Visit.where("started_at > ?", 1.day.ago).count
  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_visit, on_date: Date.today, value: visits)
  @statistic.save

  copy_count = Ahoy::Event.where("time > ?", 1.day.ago).where(name: "Copy Code").distinct.pluck(:visit_id, :properties).count
  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_copies, on_date: Date.today, value: copy_count)
  @statistic.save

  visit_count = Ahoy::Event.where("time > ?", 1.day.ago).where(name: "Posts Visit").distinct.pluck(:visit_id, :properties).count
  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_post_visits, on_date: Date.today, value: visit_count)
  @statistic.save
end
