class ProjectBackupsController < ApplicationController
  before_action except: [:show] do
    redirect_to login_path unless current_user
  end

  def index
    @project = current_user.projects.find_by_uuid!(params[:uuid])
  end

  def show
    @project_backup = ProjectBackup.find_by_uuid!(params[:uuid])

    if (!is_project_owner(@project_backup.project)) return

    render json: @project_backup, layout: false
  end

  def create
    @project = current_user.projects.find_by_uuid!(project_params[:uuid])
    @project_backup = ProjectBackup.create(title: project.title)

    if @project.save
      render json: @project_backup, layout: false
    else
      render json: @project_backup.errors.to_json, status: 500, layout: false
    end
  end

  def destroy
    @project_backup = ProjectBackup.find_by_uuid!(project_backup_params[:uuid])

    if (!is_project_owner(@project_backup.project)) return

    if @project.destroy
      render json: "Success", layout: false
    else
      render json: @project.errors.to_json, status: 500, layout: false
    end
  end

  private

  def is_project_owner(project)
    current_user.present? && current_user.id == project.user_id
  end

  def project_params
    params.require(:project).permit(:uuid)
  end

  def project_backup_params
    params.require(:project_backup).permit(:uuid)
  end
end
