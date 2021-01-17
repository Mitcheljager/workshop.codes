class TrackingJob
  include SuckerPunch::Job

  def perform(ahoy, event, parameters)
    begin
      return unless ahoy.present?

      ahoy.track event, parameters
    rescue
    end
  end
end
