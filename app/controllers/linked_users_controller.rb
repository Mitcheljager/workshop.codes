class LinkedUsersController < ApplicationController
  before_action do
    redirect_to root_path unless current_user
  end

  def index; end

  def destroy
    @user = User.find(params[:id])

    return unless @user.linked_id == current_user.id

    if @user.destroy
      flash[:alert] = "Account successfully unlinked."
    else
      flash[:error] = "Something went wrong. Please try again."
    end

    redirect_to linked_users_path
  end
end
