class SearchController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    unless params[:query].empty?
      track_action

      respond_to do |format|
        format.js { redirect_to build_filter_path(:search, params[:query].gsub(".", "")) }
        format.html { redirect_to build_filter_path(:search, params[:query].gsub(".", "")) }
      end
    else
      redirect_back fallback_location: root_path
    end
  end

  def show
    redirect_to root_path
  end

  private

  def track_action
    parameters = request.path_parameters
    parameters[:search] = params[:search]

    TrackingJob.perform_async(ahoy, "Search", parameters)
  end
end
