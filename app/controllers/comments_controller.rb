class CommentsController < ApplicationController
  include NotificationsHelper

  def create
    @comment = Comment.new(comment_params)
    @comment.user_id = current_user.id
    @post = @comment.post

    if @comment.save
      create_activity(:create_comment, comment_activity_params)

      if @comment.parent_id
        parent_comment_user = Comment.find(@comment.parent_id).user

        if @comment.user != parent_comment_user
          create_notification(
            "Someone **has replied** to your comment on **\"==#{ @comment.post.title }==\"**",
            post_tab_path(@comment.post.code, "comments", anchor: @comment.id),
            parent_comment_user.id,
            :comment_reply,
            "comment",
            @comment.id
          )
        end
      else
        if @comment.user != @comment.post.user
          create_notification(
            "Someone **has left a comment** on **\"==#{ @comment.post.title }==\"**",
            post_tab_path(@comment.post.code, "comments", anchor: @comment.id),
            @comment.post.user.id,
            :comment,
            "comment",
            @comment.id
          )
        end
      end

      respond_to :js

      notify_discord
    else
      respond_to do |format|
        format.js { render "application/error" }
      end
    end
  end

  def show
    paginated_comments

    render layout: false
  end

  def more
    paginated_comments

    render @comments, layout: false
  end

  def update
    @comment = Comment.find_by_id_and_user_id(params[:id], current_user.id)
    @post = @comment.post

    if @comment.update(comment_params)
      create_activity(:update_comment, comment_activity_params)

      respond_to :js
    else
      respond_to do |format|
        format.js { render "application/error" }
      end
    end
  end

  def destroy
    @comment = Comment.find_by_id_and_user_id(params[:id], current_user.id)

    if @comment.destroy
      create_activity(:destroy_comment, comment_activity_params)

      respond_to :js
    else
      respond_to do |format|
        format.js { render "application/error" }
      end
    end
  end

  def create_reply_form
    @parent_id = params[:comment_id]
    @post = Comment.find(@parent_id).post

    respond_to :js
  end

  def create_edit_form
    @comment = Comment.find(params[:comment_id])
    @comment_id = @comment.id
    @post = @comment.post

    respond_to :js
  end

  def failed_authenticity_token
    respond_to do |format|
      format.js { render "application/error" }
    end
  end

  private

  def comment_activity_params
    { id: @comment.id }
  end

  def comment_params
    params.require(:comment).permit(:post_id, :content, :parent_id)
  end

  def paginated_comments
    @post = Post.find_by_id!(params[:id])
    @comments = @post.comments.includes(:user).where(parent_id: nil).order(created_at: :desc).page(params[:page])
  end

  def notify_discord
    return unless ENV["DISCORD_COMMENTS_WEBHOOK_URL"].present?

    comment = @comment
    post = comment.post
    user = comment.user
    url = post_tab_url(post.code.upcase, "comments")
    user_url = user_url(user.username)
    content = comment.content

    embed = Discord::Embed.new do
      author name: user.username, url: user_url
      title "#{user.username} posted a comment on \"#{ post.title }\""
      url url
      description content
    end

    Discord::Notifier.message(embed, url: ENV["DISCORD_COMMENTS_WEBHOOK_URL"])
  rescue => error
    Bugsnag.notify(error) if Rails.env.production?
  end
end
