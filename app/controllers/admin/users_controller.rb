class Admin::UsersController < Admin::BaseController
  def index
    @users = User.order(created_at: :desc).page(params[:page])
    @users = @users.where(params[:where], true).or(@users.where.not(params[:where] => ["", false, nil])) if params[:where].present?
  end

  def show
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    @user.nice_url = @user.username.gsub(" ", "-").split("#")[0]

    if @user.update(user_params)
      create_activity(:admin_update_user, { user_id: @user.id, level: @user.level, verified: @user.verified })
      flash[:alert] = "User saved"
    else
      flash[:alert] = "Something went wrong when saving"
    end

    redirect_to admin_user_path(@user.id)
  end

  def find
    @user = User.find_by_username!(params[:username])
    redirect_to admin_user_path(@user.id)
  end

  def send_notification
    @user = User.find(params[:user_id]).first

    @notification = Notification.new(user_id: @user.id, content: params[:notification_content])

    if @notification.save
      create_activity(:admin_send_notification, { user_id: @notification.user_id, content: @notification.content })

      flash[:alert] = "Notification created"
      redirect_to admin_user_path(@user.id)
    end
  end

  private

  def user_params
    params.require(:user).permit(:level, :verified)
  end
end
