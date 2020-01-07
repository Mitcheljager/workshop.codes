class AdminController < ApplicationController
  before_action do
    redirect_to root_path unless current_user && current_user.username == "admin"
  end

  def index
    @posts = Post.select(:created_at).all
    @users = User.select(:created_at).all
    @comments = Comment.select(:created_at).all
    @favorites = Favorite.select(:created_at).all
    @notifications = Notification.select(:created_at).all
  end

  def posts
    @posts = Post.order(created_at: :desc)
  end

  def users
    @users = User.order(created_at: :desc)
  end

  def comments
    @comments = Comment.order(created_at: :desc)
  end

  def favorites
    @favorites = Favorite.order(created_at: :desc).limit(200)
  end

  def notifications
    @notifications = Notification.order(created_at: :desc)
  end
end
