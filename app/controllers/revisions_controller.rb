class RevisionsController < ApplicationController
  layout false, only: [:raw_snippet]
  before_action :set_revision

  before_action except: [:show] do
    redirect_to root_path unless current_user && current_user == @revision.post.user && @revision.visible
  end

  def show
    @difference = Diffy::Diff.new(@revision.snippet, @revision.post.snippet).to_s(:html_simple)
  end

  def raw_snippet
    respond_to do |format|
      format.json
    end
  end

  def edit
  end

  def update
    if @revision.update(revision_params)
      create_activity(:update_revision, revision_activity_params)

      redirect_to post_path(@revision.post.code)
    else
      render :edit
    end
  end

  private

  def set_revision
    @revision = Revision.includes(:post).find(params[:id])
  end

  def revision_activity_params
    { ip_address: last_4_digits_of_request_ip, id: @revision.id }
  end

  def revision_params
    params.require(:revision).permit(:version, :description)
  end
end
