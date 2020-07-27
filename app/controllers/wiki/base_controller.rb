class Wiki::BaseController < ApplicationController
  add_breadcrumb "Home", :wiki_root_path

  def index
    @categories = Wiki::Category.order(title: :asc)
    @edits = Wiki::Edit.order(created_at: :desc).limit(10)
    @unapproved_edits_count = Wiki::Edit.where(approved: false).size
  end

  private

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end
end
