class SearchController < ApplicationController
  skip_before_action :verify_authenticity_token
  
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
