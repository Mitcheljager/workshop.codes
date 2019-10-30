class CommentsController < ApplicationController
  include NotificationsHelper

  def create
    @comment = Comment.new(comment_params)
    @comment.user_id = current_user.id

    if @comment.save
      if @comment.user != @comment.post.user
        if @comment.parent_id
          create_notification(
            "Someone has replied to your comment on \"#{ @comment.post.title }\"",
            "#{ post_path(@comment.post.code) }##{@comment.id}",
            Comment.find(@comment.parent_id).user.id
          )
        else
          create_notification(
            "Someone has left a comment on \"#{ @comment.post.title }\"",
            "#{ post_path(@comment.post.code) }##{@comment.id}",
            @comment.post.user.id
          )
        end
      end

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
