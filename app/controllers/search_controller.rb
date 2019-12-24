class SearchController < ApplicationController
  def index
    unless params[:query].empty?
      redirect_to build_filter_path(:search, params[:query].gsub(".", ""))
    else
      redirect_back fallback_location: root_path
    end
  end
end
