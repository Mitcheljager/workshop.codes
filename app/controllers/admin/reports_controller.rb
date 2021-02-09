class Admin::ReportsController < Admin::BaseController
  def index
    @reports = Report.order(created_at: :desc).page(params[:page])
  end

  def show
    @report = Report.find(params[:id])
    begin
      @post = Post.find(@report.concerns_id) if @report.concerns_model == "post"
    rescue ActiveRecord::RecordNotFound
      @post = nil
      if @report.unresolved?
        flash[:notice] = "The post that this unresolved report is about cannot be found. As a result, it has been automatically archived."
        @report.archived!
      end
    end
  end
end
