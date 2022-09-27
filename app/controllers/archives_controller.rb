class ArchivesController < ApplicationController
  before_action :set_post
  before_action do
    @archive_authorization = get_archive_authorization
  end
  before_action only: [:update, :destroy] do
    unless @archive_authorization.present?
      flash[:error] = "You are not authorized to perform that action"
      redirect_back fallback_location: post_path(@post.code)
    end
  end

  def show
    potential_auth = ArchiveAuthorization.find_by(code: @post.code)
    redirect_to(post_path(code: @post.code), flash: { error: "This post is not an archive post." }) unless potential_auth.present?
  end

  def update
    unless current_user.present?
      redirect_to login_path, flash: { error: "You need to be logged into an existing Workshop.codes account in order to transfer ownership" }
      return
    end

    begin
      @post.transaction do
        @post.user = current_user
        @post.save!
        @archive_authorization.destroy!
      end

      create_activity(:transfer_archive_post, {
        id: @post.id,
        authorizing_bnet_uid: session[:oauth_uid]})

      flash[:notice] = "Post successfully transferred"
      redirect_to post_path(@post.code)
    rescue ActiveRecord::RecordNotDestroyed, ActiveRecord::RecordInvalid, ActiveRecord::RecordNotSaved
      flash[:error] = "Something went wrong when transferring the post to you."
      redirect_to post_path(@post.code)
    end
  end

  def destroy
    begin
      @post.transaction do
        @post.destroy!
        @archive_authorization.destroy!
      end

      create_activity(:delete_archive_post,
        {
          id: @post.id,
          authorizing_bnet_uid: session[:oauth_uid]},
        User.find_by!(username: "elo-hell-archive").id)

      flash[:notice] = "Post successfully deleted"
      redirect_to posts_url
    rescue ActiveRecord::RecordNotDestroyed
      flash[:error] = "Something went wrong while trying to delete the post."
      redirect_back fallback_location: post_path(@post.code)
    end
  end

  private

  def set_post
    @post = Post.find_by_code(params[:code])
  end

  def get_archive_authorization
    authorization = ArchiveAuthorization.find_by(code: @post.code)
    return nil unless authorization.present?

    if session[:oauth_provider] == "bnet" && session[:oauth_uid] == authorization.bnet_id
      return authorization
    end
    if current_user.present? && current_user.provider == "bnet" && current_user.uid == authorization.bnet_id
      return authorization
    end
    if @current_user.present? &&
        @current_user.linked_users.where(provider: "bnet", uid: authorization.bnet_id).any?
      return authorization
    end

    nil
  end
end
