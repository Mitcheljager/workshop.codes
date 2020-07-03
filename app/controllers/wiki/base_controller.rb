class Wiki::BaseController < ApplicationController
  add_breadcrumb "Home", :wiki_root_path

  def index
    @categories = Wiki::Category.all
    @edits = Wiki::Edit.order(created_at: :desc).limit(5)
    @articles = Wiki::Article.approved.group(:group_id).maximum(:id).values
    @articles = Wiki::Article.approved.where(id: @articles).order(created_at: :desc).limit(5)
    @unapproved_edits_count = Wiki::Edit.where(approved: false).size
  end

  private

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end
end
