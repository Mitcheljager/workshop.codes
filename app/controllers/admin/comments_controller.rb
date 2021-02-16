class Admin::CommentsController < Admin::BaseController
  def index
    @comments = Comment.order(created_at: :desc).page(params[:page])
  end

  def destroy
    @comment = Comment.find(params[:id])

    if @comment.destroy
      create_activity(:admin_destroy_comment, { comment_id: @comment.id, post_id: @comment.post.id, comment_user_id: @comment.user_id })

      flash[:alert] = "Comment destroyed"
      redirect_to admin_comments_path
    end
  end
end
