class Admin::BaseController < ApplicationController
  include UsersHelper

  before_action do
    redirect_to root_path unless is_admin?(current_user)
  end

  def index
    @admin_activity = Activity.where(content_type: [:admin_destroy_post, :admin_update_user, :admin_create_badge, :admin_send_notification, :admin_destroy_comment])
                              .order(created_at: :desc)
                              .limit(20)
  end
end
