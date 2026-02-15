class Admin::PostsController < Admin::BaseController
  def index
    @posts = Post.order((params[:order].present? ? params[:order] : "created_at") + " DESC").page(params[:page])
  end

  def show
    @post = Post.find(params[:id])
    @views = Statistic.where(model_id: @post.id).where(content_type: :visit).pluck(:on_date, :value).map do |on_date, value|
      { date: on_date.strftime("%Y-%m-%d"), value: }
    end
    @copies = Statistic.where(model_id: @post.id).where(content_type: :copy).pluck(:on_date, :value).map do |on_date, value|
      { date: on_date.strftime("%Y-%m-%d"), value: }
    end
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

  def destroy_image
    begin
      @post = Post.find(params[:post_id])
      @image = @post.images.find(params[:image_id])
      blob_id = @image.blob_id

      @image.purge

      # Remove the blob_id from image_order if it was present in the array
      image_order = JSON.parse(@post.image_order || "[]")
      updated_order = image_order.reject { |id| id == blob_id }

      if image_order != updated_order
        @post.update(image_order: updated_order.to_json)
      end

      create_activity(:admin_destroy_post_image, { post_id: @post.id, code: @post.code, post_user_id: @post.user_id })
      flash[:notice] = "Image was removed"

      redirect_to admin_post_path(@post.id)
    rescue => e
      flash[:error] = "Image could not be removed: #{e.message}"
      redirect_to admin_post_path(@post.id)
    end
  end
end
