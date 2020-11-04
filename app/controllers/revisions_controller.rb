class RevisionsController < ApplicationController
  layout false, only: [:raw_snippet]
  before_action :set_revision, except: [:index]

  before_action except: [:show, :raw_snippet, :index] do
    redirect_to root_path unless current_user && current_user == @revision.post.user && @revision.visible
  end

  def index
    @post = Post.find_by_code(params[:code])
    @revisions = Revision.where(post_id: @post).select(:id, :post_id, :title, :version, :code, :description, :created_at, :updated_at).order(created_at: :desc)
  end

  def show
    @revision = Revision.includes(:post).find(params[:id])
    @post = @revision.post

    not_found and return if @post.private? && @post.user != current_user

    if params[:compare_id].present?
      @compare_revision = Revision.where(post_id: @post.id).find(params[:compare_id])
    else
      @compare_revision = Revision.where(post_id: @post.id).where("id < ?", @revision.id).last
    end

    @difference = Diffy::Diff.new(@compare_revision.present? ? @compare_revision.snippet : "", @revision.snippet).to_s(:html_simple)
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
    { id: @revision.id }
  end

  def revision_params
    params.require(:revision).permit(:version, :description)
  end

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end
end
