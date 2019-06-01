class Favorite < ApplicationRecord
  validates_uniqueness_of :user_id, scope: %i[post_id]
end
