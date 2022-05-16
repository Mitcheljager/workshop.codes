class Admin::BaseController < ApplicationController
  include UsersHelper

  before_action do
    redirect_to root_path unless is_admin?(current_user)
  end

  def index
    @posts = Post.select(:created_at).all.order(created_at: :asc)
    @users = User.select(:created_at, :uuid).all.order(created_at: :asc)
    @comments = Comment.select(:created_at).all.order(created_at: :asc)
    @favorites = Favorite.select(:created_at).all.order(created_at: :asc)
    @notifications = Notification.select(:created_at).all.order(created_at: :asc)
  end
end
