class SearchController < ApplicationController
  def index
    redirect_to search_path(params[:query].gsub(".", ""))
  end
end
