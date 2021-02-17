class Admin::ReportsController < Admin::BaseController
  def index
    @reports = Report.order(created_at: :desc).page(params[:page])
  end

  def show
    @report = Report.find(params[:id])

    if @report.concerns_model == "post"
      @post = Post.find_by(id: @report.concerns_id)

      if !@post.present? && @report.unresolved?
        flash[:notice] = "The post that this unresolved report is about cannot be found. As a result, it has been automatically archived."
        @report.archived!
      end
    end

    if @report.concerns_model == "comment"
      @comment = Comment.find_by(id: @report.concerns_id)
    end
  end
end
