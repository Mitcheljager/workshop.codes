class ListingTrackingJob
  include SuckerPunch::Job

  def perform(ahoy, posts, parameters)
    return unless ahoy.present?

    visit = Ahoy::Visit.where(visit_token: ahoy.visit_id)

    posts.each do |post|
      parameters["id"] = post.id
      tracked_event = Ahoy::Event.where(name: "Listing", visit_id: visit, properties: parameters)

      ahoy.track "Listing", parameters unless tracked_event.present?
    end
  end
end
