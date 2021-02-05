class TrackingJob
  include SuckerPunch::Job

  def perform(ahoy, event, parameters)
    return unless ahoy.present?

    ActiveRecord::Base.connection_pool.with_connection do
      ahoy.track event, parameters
    end
  end
end
