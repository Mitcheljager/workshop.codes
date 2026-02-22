desc "Compress impressions of the last 24 hours in to Statistic"
task compress_impressions: :environment do
  ActiveRecord::Base.connection_pool.with_connection do
    compress_events("Posts Visit", :visit)
    compress_events("Copy Code", :copy)
    compress_visits
    compress_page_views

    Ahoy::Visit.where("started_at < ?", 1.month.ago).find_in_batches do |visits|
      visit_ids = visits.map(&:id)
      Ahoy::Event.where(visit_id: visit_ids).delete_all
      Ahoy::Visit.where(id: visit_ids).delete_all
    end
  end
end

def compress_events(event_name, content_type)
  events = Ahoy::Event.where("time > ?", 1.day.ago).where(name: event_name).distinct.pluck(:visit_id, :properties).group_by { |v| v[1]["id"] }

  events.each do |event|
    @statistic = Statistic.new(timeframe: :daily, content_type:, on_date: Date.today, value: event[1].size, properties: event[1].first[1])

    if event[1].first[1]["id"]
      @statistic.model_id = event[1].first[1]["id"]

      post = Post.find_by_id(event[1].first[1]["id"])
      post.increment!(:impressions_count, event[1].size) if post.present? && content_type == :visit
    end

    @statistic.save
  end
end

def compress_visits
  visits = Ahoy::Visit.where("started_at > ?", 1.day.ago)
  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_visit, on_date: Date.today, value: visits.size)
  @statistic.save

  post_copy_count = Ahoy::Event.where("time > ?", 1.day.ago).where(name: "Copy Code").distinct.pluck(:visit_id, :properties).size
  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_copies, on_date: Date.today, value: post_copy_count)
  @statistic.save

  post_visit_count = Ahoy::Event.where("time > ?", 1.day.ago).where(name: "Posts Visit").distinct.pluck(:visit_id, :properties).size
  @statistic = Statistic.new(timeframe: :daily, content_type: :unique_post_visit, on_date: Date.today, value: post_visit_count)
  @statistic.save
end

def compress_page_views
  page_views = Ahoy::Event.where("time > ?", 1.day.ago).where(name: "Page View")
  @statistic = Statistic.new(timeframe: :daily, content_type: :page_view, on_date: Date.today, value: page_views.size)
  @statistic.save

  events = page_views.pluck(:properties)
  groups = events.group_by do |properties|
    request = properties["request"] || {}
    [request["controller"], request["action"]]
  end

  groups.each do |(controller, action), items|
    @controller_action = Statistic.new(timeframe: :daily, content_type: :page_view_controller_action, on_date: Date.today, value: items.size, properties: { controller:, action: })
    @controller_action.save
  end
end
