class Activity < ApplicationRecord
  belongs_to :user

  serialize :properties

  enum content_type: {
    login: 0, login_from_cookie: 1, login_failed: 2, update_user: 3,
    create_post: 4, update_post: 5, destroy_post: 6,
    create_comment: 7, update_comment: 8, destroy_comment: 9,
    update_revision: 10
  }
end
