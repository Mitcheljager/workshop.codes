class Admin::ReportsController < Admin::BaseController
  def index
    @reports = Report.order(created_at: :desc).page(params[:page])
  end

  def show
    @report = Report.find(params[:id])
    @post = Post.find(@report.concerns_id) if @report.concerns_model == "post"
  end
end
