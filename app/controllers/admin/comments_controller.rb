class Admin::CommentsController < Admin::BaseController
  def index
    @comments = Comment.order(created_at: :desc).page(params[:page])
  end
end
