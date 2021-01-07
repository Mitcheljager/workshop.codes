class BadgesController < ApplicationController
  include BadgesHelper

  before_action do
    redirect_to root_path unless is_admin?(current_user)
  end

  def create
    @user = User.find(badge_params[:user_id])

    if create_badge(badge_id: badge_params[:badge_id], user: @user)
      redirect_to admin_user_path(badge_params[:user_id])
      flash[:alert] = "Badge created"
    end
  end

  private

  def badge_params
    params.require(:badge).permit(:badge_id, :user_id)
  end
end
