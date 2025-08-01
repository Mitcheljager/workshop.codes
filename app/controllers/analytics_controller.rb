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
    date_counts = []
    if current_user.posts.any?
      latest_date = [current_user.posts.first.created_at.strftime("%Y-%m-%d"), 6.months.ago.strftime("%Y-%m-%d")].max

      (Date.parse(latest_date)...DateTime.now).each do |date|
        date_counts << { date: date.strftime("%Y-%m-%d"), value: 0 }
      end
    else
      date_counts << { date: DateTime.now.strftime("%Y-%m-%d"), value: 0 }
    end

    if params[:type] == "copies"
      @items = Statistic.where(model_id: current_user.posts.select(:id).pluck(:id)).where(content_type: :copy).order(created_at: :asc)
    elsif params[:type] == "views"
      @items = Statistic.where(model_id: current_user.posts.select(:id).pluck(:id)).where(content_type: :visit).order(created_at: :asc)
    elsif params[:type] == "listings"
      @items = Statistic.where(model_id: current_user.posts.select(:id).pluck(:id)).where(content_type: :listing).order(created_at: :asc)
    elsif params[:type] == "favorites"
      @items = Favorite.where(post_id: current_user.posts.select(:id).pluck(:id)).order(created_at: :asc)
    end

    if params[:type] == "favorites"
      @items.group_by { |x| x.created_at.strftime("%Y-%m-%d") }.each do |date, values|
        this = date_counts.detect { |d| d[:date] == date }
        this[:value] = values.count if this.present?
      end
    else
      @items.group_by { |x| (x.on_date).strftime("%Y-%m-%d") }.each do |date, values|
        this = date_counts.detect { |d| d[:date] == date }
        this[:value] = values.map { |h| h[:value] }.sum if this.present?
      end
    end

    render json: date_counts, layout: false
  end

  private

  def create_date_count
    latest_date = [@post.created_at.strftime("%Y-%m-%d"), 6.months.ago.strftime("%Y-%m-%d")].max

    date_counts = []
    (Date.parse(latest_date)...DateTime.now).each do |date|
      date_counts << { date: date.strftime("%Y-%m-%d %H:00"), value: 0 }
    end

    date_counts
  end

  def create_daily_counts(type)
    counts = create_date_count
    daily = Statistic.where(model_id: @post.id).where(content_type: type).order(created_at: :asc)
    daily.group_by { |x| (x.on_date).to_date.strftime("%Y-%m-%d %H:00") }.each do |date, values|
      this = counts.detect { |d| d[:date] == date }
      this[:value] = values.map { |h| h[:value] }.sum if this.present?
    end

    counts
  end
end
