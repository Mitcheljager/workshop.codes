class AccessibilityController < ApplicationController
  before_action only: [:index] do
    redirect_to login_path unless current_user
  end

  def edit
    @user = current_user
    redirect_to root_path unless @user
  end

  def update
    @user = current_user
    if @user.update(user_params)
      flash[:alert] = "Successfully saved"
      redirect_to accessibility_path
    else
      render :edit
    end
  end

  private
  def user_params
    params.require(:user).permit(:high_contrast, :large_fonts)
  end
end
