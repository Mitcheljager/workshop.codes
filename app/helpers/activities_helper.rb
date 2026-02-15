module ActivitiesHelper
  def create_activity(content_type, properties = {}, user_id = current_user.id)
    Activity.create(user_id:, content_type:, properties:)
  end
end
