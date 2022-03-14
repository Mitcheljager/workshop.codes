class LinkedUsersController < ApplicationController
  before_action do
    redirect_to root_path unless current_user
  end

  def index
    @linked_users = User.where(linked_id: current_user.id)
  end

  def destroy
    @user = User.find(params[:id])

    return unless @user.linked_id == current_user.id

    if @user.destroy
      flash[:alert] = { class: "", message: "Account successfully unlinked." }
    else
      flash[:alert] = { class: "red", message: "Something went wrong. Please try again." }
    end

    redirect_to linked_users_path
  end
end
