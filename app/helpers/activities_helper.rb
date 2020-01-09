module ActivitiesHelper
  def create_activity(content_type, properties, user_id = current_user.id)
    Activity.create!(user_id: user_id, content_type: content_type, properties: properties)
  end
end
