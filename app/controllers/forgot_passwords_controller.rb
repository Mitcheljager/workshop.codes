class ForgotPasswordsController < ApplicationController
  before_action do
    redirect_to root_path if current_user
  end

  def index
  end

  def show
    @forgot_password_token = ForgotPasswordToken.where(token: params[:token]).where("created_at > ?", 1.hour.ago).last

    not_found unless @forgot_password_token.present?
  end

  def new
    @forgot_password_token = ForgotPasswordToken.new
  end

  def create
    @user = User.find_by_email(forgot_password_params[:email])

    if @user.present?
      @forgot_password_token = ForgotPasswordToken.new(user_id: @user.id, token: SecureRandom.base64)

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
        redirect_to login_path
      else
        render :show
      end
    end
  end

  private

  def forgot_password_params
    params.require(:forgot_password).permit(:email, :password, :password_confirmation, :token)
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end
end
