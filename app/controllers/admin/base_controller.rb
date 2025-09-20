class Admin::BaseController < ApplicationController
  include UsersHelper

  before_action do
    redirect_to root_path unless is_admin?(current_user)
  end

  def index
    @unique_visits = Statistic.where(content_type: :unique_visit)
                              .pluck(:on_date, :value)
                              .group_by { |on_date, _| on_date.beginning_of_week }
                              .map do |week_start, rows| { date: week_start.strftime("%Y-%m-%d"), value: rows.sum { |_, v| v } } end

    @unique_copies = Statistic.where(content_type: :unique_copies)
                              .pluck(:on_date, :value)
                              .group_by { |on_date, _| on_date.beginning_of_week }
                              .map do |week_start, rows| { date: week_start.strftime("%Y-%m-%d"), value: rows.sum { |_, v| v } } end

    @admin_activity = Activity.where(content_type: [:admin_destroy_post, :admin_update_user, :admin_create_badge, :admin_send_notification, :admin_destroy_comment, :admin_destroy_user, :admin_destroy_post_image])
                              .order(created_at: :desc)
                              .limit(20)
  end
end
