class ProjectsController < ApplicationController
  before_action do
    redirect_to login_path unless current_user
  end

  def show
    @project = current_user.projects.find_by_uuid(params[:uuid])

    render json: @project, layout: false
  end

  def create
    @project = Project.create(title: project_params[:title], user_id: current_user.id)

    if @project.save
      render json: @project, layout: false
    else
      render json: "", status: 500, layout: false
    end
  end

  def update
    @project = current_user.projects.find_by_uuid(params[:uuid])

    if @project.update(project_params)
      render json: @project, layout: false
    else
      render json: "", status: 500, layout: false
    end
  end

  def destroy
    @project = current_user.projects.find_by_uuid(params[:uuid])

    if @project.destroy
      render json: "Success", layout: false
    else
      render json: "", status: 500, layout: false
    end
  end

  private

  def project_params
    params.require(:project).permit(:title, :content)
  end
end
