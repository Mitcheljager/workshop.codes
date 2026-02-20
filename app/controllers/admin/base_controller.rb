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
      get_statistics(:unique_visit, from, short_period)
    end

    @unique_copies = Rails.cache.fetch("admin_statistics/unique_copies/#{from}-#{short_period}", expires_in: 12.hours) do
      get_statistics(:unique_copies, from, short_period)
    end

    @page_views = Rails.cache.fetch("admin_statistics/page_views/#{from}-#{short_period}", expires_in: 12.hours) do
      get_statistics(:page_view, from, short_period)
    end
  end

  def analytics_partial
    top_pages_events = get_events("Page View")
    top_posts_events = get_events("Copy Code")

    # This is ugly as hell
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

    render partial: "analytics"
  end

  private

  def get_statistics(content_type, from, short_period)
    Statistic.where(content_type:)
             .where("on_date > ?", from)
             .pluck(:on_date, :value)
             .group_by { |on_date, _| short_period ? on_date.to_date : on_date.beginning_of_week }
             .map do |period_start, rows| {
                date: period_start.strftime("%Y-%m-%d"),
                label: short_period ? period_start.strftime("%b %-d, %Y") : "#{period_start.strftime("%b %-d, %Y")} to #{period_start.end_of_week.strftime("%b %-d, %Y")}",
                value: rows.sum { |_, v| v }
             } end
  end

  def get_events(name)
    Ahoy::Event.where(name:).where("time > ?", 24.hours.ago).pluck(:properties)
  end
end
