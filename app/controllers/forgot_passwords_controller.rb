class ForgotPasswordsController < ApplicationController
  before_action :honeypot, only: [:create]

  before_action do
    redirect_to root_path if current_user
  end

  def index
  end

  def show
    @forgot_password_token = ForgotPasswordToken.where(token: params[:token]).last

    not_found unless @forgot_password_token.present?

    if @forgot_password_token.created_at <= 1.hour.ago
      flash[:error] = "This password reset token has expired. Please request a new token."
      redirect_to new_forgot_password_path
    end
  end

  def new
  end

  def create
    @user = User.find_by_email(forgot_password_params[:email])

    return if @user.provider.present?

    if @user.present?
      recent_tokens_count = ForgotPasswordToken.where(user_id: @user.id).where("created_at > ?", 1.day.ago).size
      total_tokens_count = ForgotPasswordToken.where(user_id: @user.id).size

      # User requested too many tokens either recently or in total
      if recent_tokens_count > 10 || total_tokens_count > 200
        Bugsnag.notify("User requested too many forgot password tokens recently") if Rails.env.production?
        redirect_to forgot_passwords_path
        return
      end

      @forgot_password_token = ForgotPasswordToken.new(user_id: @user.id, token: SecureRandom.uuid)

      if @forgot_password_token.save
        create_activity(:forgot_password, {}, @user.id)
        ForgotPasswordsMailer.with(token: @forgot_password_token.token).send_token.deliver_later
      end
    end

    redirect_to forgot_passwords_path
  end

  def reset_password
    @forgot_password_token = ForgotPasswordToken.where(token: forgot_password_params[:token]).where("created_at > ?", 1.hour.ago).last

    if @forgot_password_token.present?
      @user = User.find_by_email(@forgot_password_token.user.email)

      if @user.update(forgot_password_params.except(:token, :email))
        create_activity(:password_reset, {}, @user.id)
        flash[:notice] = "Password successfully reset"
        redirect_to login_path
      else
        render :show
      end
    else
      flash[:error] = "Invalid token. It may have expired."
      redirect_to new_forgot_password_path
    end
  end

  private

  def forgot_password_params
    params.require(:forgot_password).permit(:email, :email_confirmation, :password, :password_confirmation, :token)
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end

  def honeypot
    return if forgot_password_params[:email_confirmation].blank?

    Bugsnag.notify("User was blocked from requesting password reset via honeypot") if Rails.env.production?
    redirect_to forgot_passwords_path
  end
end
