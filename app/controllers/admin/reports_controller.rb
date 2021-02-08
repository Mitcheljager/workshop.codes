class Admin::ReportsController < Admin::BaseController
  def index
    @reports = Report.order(created_at: :desc).page(params[:page])
  end

  def show
    @report = Report.find(params[:id])
    begin
      @post = Post.find(@report.concerns_id) if @report.concerns_model == "post"
    rescue ActiveRecord::RecordNotFound
      flash[:alert] = "The post that this report is about cannot be found. As a result, the report has been automatically archived."
      @report.archived!
      @post = nil
    end
  end
end
