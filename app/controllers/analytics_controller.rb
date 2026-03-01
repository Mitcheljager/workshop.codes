class AnalyticsController < ApplicationController
  def post
    @post = Post.select_overview_columns.find(params[:id])

    return if @post.user != current_user

    counts = {}

    if params[:type] == "daily-copies"
      counts = create_daily_counts(:copy)
    elsif params[:type] == "daily-views"
      counts = create_daily_counts(:visit)
    elsif params[:type] == "daily-listings"
      counts = create_daily_counts(:listing)
    end

    render json: counts, layout: false
  end

  def user
    if current_user.posts.none?
      date_counts = [{ date: DateTime.now.strftime("%Y-%m-%d"), value: 0 }]

      render json: date_counts, layout: false and return
    end

    from = [Date.parse(params[:from]).strftime("%Y-%m-%d"), 5.years.ago.strftime("%Y-%m-%d")].max
    date_counts = create_date_count(from)
    post_ids = current_user.posts.select(:id).pluck(:id)

    if params[:type] == "copies"
      items = Statistic.where(model_id: post_ids).where(content_type: :copy).where("created_at > ?", from).order(created_at: :asc)
    elsif params[:type] == "views"
      items = Statistic.where(model_id: post_ids).where(content_type: :visit).where("created_at > ?", from).order(created_at: :asc)
    elsif params[:type] == "favorites"
      items = Favorite.where(post_id: post_ids).where("created_at > ?", from).order(created_at: :asc)
    end

    if params[:type] == "favorites"
      items.group_by { |x| x.created_at.strftime("%Y-%m-%d") }.each do |date, values|
        this = date_counts.detect { |d| d[:date] == date }
        this[:value] = values.count if this.present?
      end
    else
      items.group_by { |x| (x.on_date).strftime("%Y-%m-%d") }.each do |date, values|
        this = date_counts.detect { |d| d[:date] == date }
        this[:value] = values.map { |h| h[:value] }.sum if this.present?
      end
    end

    render json: date_counts, layout: false
  end

  private

  def create_date_count(from)
    date_counts = []

    (Date.parse(from)...DateTime.now).each do |date|
      date_counts << { date: date.strftime("%Y-%m-%d"), value: 0 }
    end

    date_counts
  end

  def create_daily_counts(type)
    latest_date = [@post.created_at.strftime("%Y-%m-%d"), 1.year.ago.strftime("%Y-%m-%d")].max
    counts = create_date_count(latest_date)

    daily = Statistic.where(model_id: @post.id).where(content_type: type).where("created_at > ?", latest_date).order(created_at: :asc)

    daily.group_by { |x| (x.on_date).to_date.strftime("%Y-%m-%d") }.each do |date, values|
      date_value = counts.detect { |d| d[:date] == date }
      date_value[:value] = values.map { |h| h[:value] }.sum if date_value.present?
    end

    counts
  end
end
