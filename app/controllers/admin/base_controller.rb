class Admin::BaseController < ApplicationController
  include UsersHelper

  before_action do
    redirect_to root_path unless is_admin?(current_user)
  end

  def index
    from = params[:from] || 100.years.ago
    short_period = params[:period] === "short"

    @admin_activity = Activity.where(content_type: [:admin_destroy_post, :admin_update_user, :admin_create_badge, :admin_send_notification, :admin_destroy_comment, :admin_destroy_user, :admin_destroy_post_image])
                              .order(created_at: :desc)
                              .limit(20)

    @unique_visits = Rails.cache.fetch("admin_statistics/unique_visits/#{from}-#{short_period}", expires_in: 12.hours) do
      Statistic.where(content_type: :unique_visit)
               .where("on_date > ?", from)
               .pluck(:on_date, :value)
               .group_by { |on_date, _| short_period ? on_date.to_date : on_date.beginning_of_week }
               .map do |week_start, rows| { date: week_start.strftime("%Y-%m-%d"), value: rows.sum { |_, v| v } } end
    end

    @unique_copies = Rails.cache.fetch("admin_statistics/unique_visits/#{from}-#{short_period}", expires_in: 12.hours) do
      Statistic.where(content_type: :unique_copies)
               .where("on_date > ?", from)
               .pluck(:on_date, :value)
               .group_by { |on_date, _| short_period ? on_date.to_date : on_date.beginning_of_week }
               .map do |week_start, rows| { date: week_start.strftime("%Y-%m-%d"), value: rows.sum { |_, v| v } } end
    end

    # This is ugly as hell
    top_pages_events = Rails.cache.fetch("admin_events/top_pages", expires_in: 1.hour) do
      Ahoy::Event.where(name: "Page View").where("time > ?", 24.hours.ago).pluck(:properties)
    end

    top_posts_events = Rails.cache.fetch("admin_events/top_posts", expires_in: 1.hour) do
      Ahoy::Event.where(name: "Copy Code").where("time > ?", 24.hours.ago).pluck(:properties)
    end

    @top_posts_by_views = top_posts_events.group_by do |props|
      props["id"]
    end.map do |id, items| {
      id:,
      count: items.size
    } end.sort_by { |item| -item[:count] }.first(10)

    @top_pages_by_views = top_pages_events.group_by do |props|
      props["url"]
    end.map do |url, items| {
      url:,
      count: items.size
    } end.sort_by { |item| -item[:count] }.first(10)
  end
end
