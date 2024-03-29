class ProjectsController < ApplicationController
  before_action except: [:show] do
    redirect_to login_path unless current_user
  end

  def show
    @project = Project.find_by_uuid!(params[:uuid])
    @project.is_owner = current_user.present? && current_user.id == @project.user_id

    render json: @project, methods: [:is_owner], layout: false
  end

  def create
    @project = Project.create(title: project_params[:title], content_type: project_params[:content_type], user_id: current_user.id)
    @project.content = project_params[:content] if project_params[:content].present?
    @project.is_owner = current_user.id == @project.user_id

    if @project.save
      render json: @project, methods: [:is_owner], layout: false
    else
      render json: @project.errors.to_json, status: 500, layout: false
    end
  end

  def update
    @project = current_user.projects.find_by_uuid!(params[:uuid])

    begin
      @project.update!(project_params)
      render json: @project, layout: false
    rescue => exception
      Bugsnag.notify(exception) if Rails.env.production?
      render json: @project.errors.full_messages, status: 500, layout: false
    end
  end

  def destroy
    @project = current_user.projects.find_by_uuid!(params[:uuid])

    if @project.destroy
      render json: "Success", layout: false
    else
      render json: @project.errors.to_json, status: 500, layout: false
    end
  end

  private

  def project_params
    params.require(:project).permit(:title, :content, :content_type)
  end
end
