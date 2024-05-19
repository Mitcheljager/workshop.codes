class Admin::BaseController < ApplicationController
  include UsersHelper

  before_action do
    redirect_to root_path unless is_admin?(current_user)
  end

  def index
    @unique_visits = Statistic.where(content_type: :unique_visit).where("on_date > ?", 12.months.ago).pluck(:on_date, :value).map do |on_date, value|
      { date: on_date.strftime("%Y-%m-%d"), value: value }
    end

    @admin_activity = Activity.where(content_type: [:admin_destroy_post, :admin_update_user, :admin_create_badge, :admin_send_notification, :admin_destroy_comment])
                              .order(created_at: :desc)
                              .limit(20)
  end
end
