class UsersController < ApplicationController
  before_action only: [:show, :edit, :update, :destroy] do
    redirect_to login_path unless current_user
  end

  before_action only: [:new] do
    redirect_to account_path if current_user
  end

  def index
    @users = User.all.order(created_at: :asc)
  end

  def show
    @posts = current_user.posts
    @favorites_received = Favorite.where(post_id: @posts.pluck(:id)).order(created_at: :asc)
    @copies_received = Statistic.where(model_id: @posts.pluck(:id)).where(content_type: :copy).order(created_at: :asc)
    @views_received = Statistic.where(model_id: @posts.pluck(:id)).where(content_type: :visit).order(created_at: :asc)
  end

  def new
    @user = User.new
  end

  def edit
    @user = current_user
    redirect_to root_path unless @user
  end

  def create
    @user = User.new(user_params)

    if @user.save
      session[:user_id] = @user.id
      generate_remember_token if params[:remember_me]

      create_activity(:create_user, { ip_address: last_4_digits_of_request_ip })
      redirect_to account_path
    else
      render :new
    end
  end

  def update
    params[:user].delete(:password).delete(:password_confirmation) if params[:user][:password].blank?

    @user = current_user
    if @user.update(user_params)
      create_activity(:update_user, { ip_address: last_4_digits_of_request_ip })
      redirect_to account_path
    else
      render :edit
    end
  end

  def destroy
    current_user.destroy
    current_user.posts.destroy_all
    current_user.favorites.destroy_all

    session[:user_id] = nil
    redirect_to login_path
  end

  def favorites
    @favorites = current_user.favorites.order(created_at: :desc).page(params[:page])
  end

  def posts
    @posts = current_user.posts.order(updated_at: :desc).page(params[:page])
  end

  def get_analytics
    @post = Post.find(params[:id])

    @daily_copies_date_counts = create_date_count
    @daily_views_date_counts = create_date_count
    @hourly_copies_counts = create_hour_count
    @hourly_views_counts = create_hour_count

    @daily_copies = Statistic.where(model_id: @post.id).where(content_type: :copy).order(created_at: :asc)
    @daily_copies.group_by { |x| x["on_date"].to_date.strftime("%Y-%m-%d") }.each do |group|
      @daily_copies_date_counts[group[0]] = group[1].map { |h| h[:value] }.sum
    end

    @daily_views = Statistic.where(model_id: @post.id).where(content_type: :visit).order(created_at: :asc)
    @daily_views.group_by { |x| x["on_date"].to_date.strftime("%Y-%m-%d") }.each do |group|
      @daily_views_date_counts[group[0]] = group[1].map { |h| h[:value] }.sum
    end

    @hourly_copies = Rails.env.development? ? Ahoy::Event.where(name: "Copy Code").distinct.last(10) : Ahoy::Event.where_event("Copy Code", id: @post.id).distinct
    @hourly_copies.group_by { |x| x["time"].strftime("%Y-%m-%d %H:00") }.each do |group|
      @hourly_copies_counts[group[0]] = group[1].map(&:visit_id).uniq.count
    end

    @hourly_views = Rails.env.development? ? Ahoy::Event.where(name: "Posts Visit").distinct.last(10) : Ahoy::Event.where_event("Posts Visit", id: @post.id).distinct
    @hourly_views.group_by { |x| x["time"].strftime("%Y-%m-%d %H:00") }.each do |group|
      @hourly_views_counts[group[0]] = group[1].map(&:visit_id).uniq.count
    end

    @merged_arrays = {
      "daily-copies": @daily_copies_date_counts,
      "daily-views": @daily_views_date_counts,
      "hourly-copies": @hourly_copies_counts,
      "hourly-views": @hourly_views_counts
    }

    render json: @merged_arrays, layout: false
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation, :email)
  end

  def create_date_count
    date_counts = {}
    (Date.parse(@post.created_at.strftime("%Y-%m-%d"))...DateTime.now).each do |date|
      date_counts[date.strftime("%Y-%m-%d")] = 0
    end

    return date_counts
  end

  def create_hour_count
    hour_counts = {}
    (1.week.ago.to_i .. DateTime.now.to_i).step(1.hour) do |date|
      hour_counts[Time.at(date).strftime("%Y-%m-%d %H:00")] = 0
    end

    return hour_counts
  end

  def generate_remember_token
    token = SecureRandom.base64
    RememberToken.create(user_id: @user.id, token: token)
  end
end
