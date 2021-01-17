class ListingTrackingJob
  include SuckerPunch::Job
  workers 4

  def perform(ahoy, posts, parameters)
    begin
      return unless ahoy.present?

      ActiveRecord::Base.connection_pool.with_connection do
        visit = Ahoy::Visit.where(visit_token: ahoy.visit_id)

        posts.each do |post|
          parameters["id"] = post.id
          tracked_event = Ahoy::Event.where(name: "Listing", visit_id: visit, properties: parameters)

          ahoy.track "Listing", parameters unless tracked_event.present?
        end
      end
    rescue
    end
  end
end
