class AdminController < ApplicationController
  before_action do
    redirect_to root_path unless current_user && current_user.username == "admin"
  end

  def index
    @posts = Post.order(created_at: :desc)
    @users = User.order(created_at: :desc)
    @snippets = Snippet.order(created_at: :desc)
    @comments = Comment.order(created_at: :desc)
    @favorites = Favorite.order(created_at: :desc)
    @notifications = Notification.order(created_at: :desc)
  end

  def posts
    @posts = Post.order(created_at: :desc)
  end

  def users
    @users = User.order(created_at: :desc)
  end

  def snippets
    @snippets = Snippet.order(created_at: :desc)
  end

  def comments
    @comments = Comment.order(created_at: :desc)
  end

  def favorites
    @favorites = Favorite.order(created_at: :desc)
  end

  def notifications
    @notifications = Notification.order(created_at: :desc)
  end
end
