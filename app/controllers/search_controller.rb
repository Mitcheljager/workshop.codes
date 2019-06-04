class SearchController < ApplicationController
  def index
    redirect_to search_path(params[:query])
  end
end
