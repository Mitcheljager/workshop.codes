class Wiki::BaseController < ApplicationController
  add_breadcrumb "Home", :wiki_root_path

  def index
    @categories = Wiki::Category.order(title: :asc)
    @edits = Wiki::Edit.includes(:user, :article).order(created_at: :desc).limit(10)
  end

  private

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end
end
