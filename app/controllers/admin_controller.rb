class AdminController < ApplicationController
  before_action do
    redirect_to root_path unless current_user && current_user.username == "admin"
  end

  def index
    @posts = Post.select(:created_at).all.order(created_at: :asc)
    @users = User.select(:created_at).all.order(created_at: :asc)
    @comments = Comment.select(:created_at).all.order(created_at: :asc)
    @favorites = Favorite.select(:created_at).all.order(created_at: :asc)
    @notifications = Notification.select(:created_at).all.order(created_at: :asc)
    @unique_users = Statistic.where(content_type: :unique_visit).order(created_at: :asc)
    @copies = Statistic.where(content_type: :copy).order(created_at: :asc)
  end

  def post
    @post = Post.find(params[:id])
    @views = Statistic.where(model_id: @post.id).where(content_type: :visit).order(created_at: :asc)
    @copies = Statistic.where(model_id: @post.id).where(content_type: :copy).order(created_at: :asc)
  end

  def posts
    @posts = Post.order(created_at: :desc).page(params[:page])
  end

  def users
    @users = User.order(created_at: :desc).page(params[:page])
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
end
