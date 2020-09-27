class AnalyticsController < ApplicationController
  def post
    @post = Post.find(params[:id])

    return if @post.user != current_user

    @daily_copies_date_counts = create_date_count
    @daily_views_date_counts = create_date_count
    @hourly_copies_counts = create_hour_count
    @hourly_views_counts = create_hour_count

    @daily_copies = Statistic.where(model_id: @post.id).where(content_type: :copy).order(created_at: :asc)
    @daily_copies.group_by { |x| x["on_date"].to_date.strftime("%Y-%m-%d") }.each do |group|
      @daily_copies_date_counts[group[0]] = group[1].map { |h| h[:value] }.sum
    end

    @daily_views = Statistic.where(model_id: @post.id).where(content_type: :visit).order(created_at: :asc)
    @daily_views.group_by { |x| x["on_date"].to_date.strftime("%Y-%m-%d") }.each do |group|
      @daily_views_date_counts[group[0]] = group[1].map { |h| h[:value] }.sum
    end

    @hourly_copies = Rails.env.development? ? Ahoy::Event.where(name: "Copy Code").distinct.last(10) : Ahoy::Event.where_event("Copy Code", id: @post.id).distinct
    @hourly_copies.group_by { |x| x["time"].strftime("%Y-%m-%d %H:00") }.each do |group|
      @hourly_copies_counts[group[0]] = group[1].map(&:visit_id).uniq.count
    end

    @hourly_views = Rails.env.development? ? Ahoy::Event.where(name: "Posts Visit").distinct.last(10) : Ahoy::Event.where_event("Posts Visit", id: @post.id).distinct
    @hourly_views.group_by { |x| x["time"].strftime("%Y-%m-%d %H:00") }.each do |group|
      @hourly_views_counts[group[0]] = group[1].map(&:visit_id).uniq.count
    end

    @merged_arrays = {
      "daily-copies": @daily_copies_date_counts,
      "daily-views": @daily_views_date_counts,
      "hourly-copies": @hourly_copies_counts,
      "hourly-views": @hourly_views_counts
    }

    render json: @merged_arrays, layout: false
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
end
