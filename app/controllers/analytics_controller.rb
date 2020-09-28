class AnalyticsController < ApplicationController
  def post
    @post = Post.find(params[:id])

    return if @post.user != current_user

    counts = {}

    if params[:type] == "daily-copies"
      counts = create_daily_counts(:copy)
    elsif params[:type] == "daily-views"
      counts = create_daily_counts(:visit)
    elsif params[:type] == "daily-listings"
      counts = create_daily_counts(:listing)
    elsif params[:type] == "hourly-copies"
      counts = create_hourly_counts("Copy Code")
    elsif params[:type] == "hourly-views"
      counts = create_hourly_counts("Posts Visit")
    elsif params[:type] == "hourly-listings"
      counts = create_hourly_counts("Listing")
    end

    render json: counts, layout: false
  end

  def user
    date_counts = {}
    if current_user.posts.any?
      latest_date = [current_user.posts.first.created_at.strftime("%Y-%m-%d"), Statistic.first.created_at.strftime("%Y-%m-%d")].max

      (Date.parse(latest_date)...DateTime.now).each do |date|
        date_counts[date.strftime("%Y-%m-%d")] = 0
      end
    else
      date_counts[DateTime.now.strftime("%Y-%m-%d")] = 0
    end

    if params[:type] == "copies"
      @copies_received = Statistic.where(model_id: current_user.posts.pluck(:id)).where(content_type: :copy).order(created_at: :asc)
      @copies_received.group_by { |x| (x.on_date - 1.day).strftime("%Y-%m-%d") }.each do |group|
        date_counts[group[0]] = group[1].map { |h| h[:value] }.sum
      end
    elsif params[:type] == "views"
      @views_received = Statistic.where(model_id: current_user.posts.pluck(:id)).where(content_type: :visit).order(created_at: :asc)
      @views_received.group_by { |x| (x.on_date - 1.day).strftime("%Y-%m-%d") }.each do |group|
        date_counts[group[0]] = group[1].map { |h| h[:value] }.sum
      end
    elsif params[:type] == "listings"
      @listings_received = Statistic.where(model_id: current_user.posts.pluck(:id)).where(content_type: :listing).order(created_at: :asc)
      @listings_received.group_by { |x| (x.on_date - 1.day).strftime("%Y-%m-%d") }.each do |group|
        date_counts[group[0]] = group[1].map { |h| h[:value] }.sum
      end
    end

    render json: date_counts, layout: false
  end

  private

  def create_date_count
    date_counts = {}
    (Date.parse(@post.created_at.strftime("%Y-%m-%d"))...DateTime.now).each do |date|
      date_counts[date.strftime("%Y-%m-%d")] = 0
    end

    return date_counts
  end

  def create_hour_count
    hour_counts = {}
    (1.week.ago.to_i .. DateTime.now.to_i).step(1.hour) do |date|
      hour_counts[Time.at(date).strftime("%Y-%m-%d %H:00")] = 0
    end

    return hour_counts
  end

  def create_daily_counts(type)
    counts = create_date_count
    daily = Statistic.where(model_id: @post.id).where(content_type: type).order(created_at: :asc)
    daily.group_by { |x| x["on_date"].to_date.strftime("%Y-%m-%d") }.each do |group|
      counts[group[0]] = group[1].map { |h| h[:value] }.sum
    end

    return counts
  end

  def create_hourly_counts(type)
    counts = create_hour_count
    hourly = Rails.env.development? ? Ahoy::Event.where(name: type).distinct.last(10) : Ahoy::Event.where_event(type, id: @post.id).distinct
    hourly.group_by { |x| x["time"].strftime("%Y-%m-%d %H:00") }.each do |group|
      counts[group[0]] = group[1].map(&:visit_id).uniq.count
    end

    return counts
  end
end
