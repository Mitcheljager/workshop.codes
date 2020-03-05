class TrackingJob
  include SuckerPunch::Job

  def perform(ahoy, event, parameters)
    ahoy.track event, parameters
  end
end
