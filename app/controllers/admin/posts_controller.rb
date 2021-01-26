class Admin::PostsController < Admin::BaseController
  def index
    @posts = Post.order((params[:order].present? ? params[:order] : "created_at") + " DESC").page(params[:page])
  end

  def show
    @post = Post.find(params[:id])
    @views = Statistic.where(model_id: @post.id).where(content_type: :visit).order(created_at: :asc)
    @copies = Statistic.where(model_id: @post.id).where(content_type: :copy).order(created_at: :asc)
  end

  def find
    @post = Post.find_by_title!(params[:title])
    redirect_to admin_post_path(@post.id)
  end

  def destroy
    @post = Post.find(params[:id])
    @user = @post.user

    if @post.destroy
      @notification = Notification.create(user_id: @user.id, content: params[:notification_content]) if params[:notification_content].present?
      create_activity(:admin_destroy_post, { post_id: @post.id, code: @post.code, post_user_id: @post.user_id, notification_content: params[:notification_content] || "" })
      redirect_to admin_posts_path
    end
  end
end
