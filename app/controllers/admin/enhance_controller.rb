class Admin::EnhanceController < Admin::BaseController
  def index
    @enhance_audio_files = Enhance::AudioFile.order(created_at: :desc).page(params[:page])
  end
end
