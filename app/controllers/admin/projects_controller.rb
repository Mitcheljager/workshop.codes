class Admin::ProjectsController < Admin::BaseController
  def index
    @projects = Project.select(:id, :title, :uuid, :created_at, :updated_at, :content_type, :user_id).order(created_at: :desc).page(params[:page])
  end
end
