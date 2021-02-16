class Activity < ApplicationRecord
  belongs_to :user

  serialize :properties

  enum content_type: {
    login: 0, login_from_cookie: 1, login_failed: 2,
    update_user: 3, create_user: 11,
    create_post: 4, update_post: 5, destroy_post: 6,
    create_comment: 7, update_comment: 8, destroy_comment: 9,
    update_revision: 10,
    forgot_password: 12, password_reset: 13,
    create_wiki_article: 14, update_wiki_article: 15,
    admin_destroy_post: 16, admin_update_user: 17, admin_create_badge: 18, admin_send_notification: 19, admin_destroy_comment: 20
  }
end
