class AdminController < ApplicationController
  include UsersHelper

  before_action do
    redirect_to root_path unless is_admin?(current_user)
  end

  def index
    @posts = Post.select(:created_at).all.order(created_at: :asc)
    @users = User.select(:created_at).all.order(created_at: :asc)
    @comments = Comment.select(:created_at).all.order(created_at: :asc)
    @favorites = Favorite.select(:created_at).all.order(created_at: :asc)
    @notifications = Notification.select(:created_at).all.order(created_at: :asc)
  end

  def posts
    @posts = Post.order((params[:order].present? ? params[:order] : "created_at") + " DESC").page(params[:page])
  end

  def post
    @post = Post.find(params[:id])
    @views = Statistic.where(model_id: @post.id).where(content_type: :visit).order(created_at: :asc)
    @copies = Statistic.where(model_id: @post.id).where(content_type: :copy).order(created_at: :asc)
  end

  def find_post
    @post = Post.find_by_title!(params[:title])
    redirect_to admin_post_path(@post.id)
  end

  def destroy_post
    @post = Post.find(params[:id])
    @user = @post.user

    if @post.destroy
      @notification = Notification.create(user_id: @user.id, content: params[:notification_content]) if params[:notification_content].present?
      create_activity(:admin_destroy_post, { post_id: @post.id, code: @post.code, post_user_id: @post.user_id, notification_content: params[:notification_content] || "" })
      redirect_to admin_posts_path
    end
  end

  def users
    @users = User.order(created_at: :desc).page(params[:page])
    @users = @users.where(params[:where], true).or(@users.where.not(params[:where] => ["", false, nil])) if params[:where].present?
  end

  def user
    @user = User.find(params[:id])
  end

  def send_user_notification
    @user = User.find(params[:user_id]).first

    if Notification.create(user_id: @user.id, content: params[:notification_content])
      redirect_to admin_user_path(@user.id)
    end
  end

  def reports
    @reports = Report.order(created_at: :desc).page(params[:page])
  end

  def report
    @report = Report.find(params[:id])
    @post = Post.find(@report.concerns_id) if @report.concerns_model == "post"
  end

  def find_user
    @user = User.find_by_username!(params[:username])
    redirect_to admin_user_path(@user.id)
  end

  def update_user
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

  def comments
    @comments = Comment.order(created_at: :desc).page(params[:page])
  end

  def favorites
    @favorites = Favorite.order(created_at: :desc).page(params[:page])
  end

  def notifications
    @notifications = Notification.order(created_at: :desc).page(params[:page])
  end

  def email_notifications
    @email_notifications = EmailNotification.order(created_at: :desc).page(params[:page])
    @forgot_password_tokens = ForgotPasswordToken.order(created_at: :desc).page(params[:page])
  end

  def activities
    @activities = Activity.order(created_at: :desc).page(params[:page])
  end

  private

  def user_params
    params.require(:user).permit(:level, :verified)
  end
end
