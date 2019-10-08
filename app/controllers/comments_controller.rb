class CommentsController < ApplicationController
  def create
    @comment = Comment.new(comment_params)
    @comment.user_id = current_user.id

    if @comment.save
      respond_to do |format|
        format.js
      end
    end
  end

  def destroy
    @comment = Comment.find_by_id_and_user_id(params[:id], current_user.id)

    if @comment.destroy
      respond_to do |format|
        format.js
      end
    end
  end

  def create_reply_form
    @parent_id = params[:comment_id]
    @post = Comment.find(@parent_id).post

    respond_to do |format|
      format.js
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:post_id, :content, :parent_id)
  end
end
