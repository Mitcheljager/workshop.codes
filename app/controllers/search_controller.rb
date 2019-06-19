class SearchController < ApplicationController
  def index
    unless params[:query].empty?
      if params[:type] == "snippets"
        redirect_to search_snippets_path(params[:query].gsub(".", ""))
      else
        redirect_to search_path(params[:query].gsub(".", ""))
      end
    else
      redirect_back fallback_location: root_path
    end
  end
end
