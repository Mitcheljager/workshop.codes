class TrackingJob
  include SuckerPunch::Job

  def perform(ahoy, event, parameters)
    return unless ahoy.present?

    ahoy.track event, parameters unless tracked_event.present?
  end
end
