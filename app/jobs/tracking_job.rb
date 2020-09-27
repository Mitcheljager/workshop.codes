class TrackingJob
  include SuckerPunch::Job

  def perform(ahoy, event, parameters)
    return unless ahoy.present?

    ahoy.track event, parameters
  end
end
