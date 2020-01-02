class SearchController < ApplicationController
  def index
    unless params[:query].empty?
      respond_to do |format|
        format.js { redirect_to build_filter_path(:search, params[:query].gsub(".", "")) }
        format.html { redirect_to build_filter_path(:search, params[:query].gsub(".", "")) }
      end
    else
      redirect_back fallback_location: root_path
    end
  end
end
