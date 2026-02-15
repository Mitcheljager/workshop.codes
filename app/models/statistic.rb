class Statistic < ApplicationRecord
  enum timeframe: {
    daily: 0,
    forever: 1
  }

  enum content_type: {
    visit: 0,
    unique_visit: 1,
    copy: 2,
    search: 3,
    listing: 4,
    unique_copies: 5,
    unique_post_visit: 6,
    unique_listings: 7,
    unique_collection_visit: 8,
    page_view: 9,
    page_view_controller_action: 10
  }

  serialize :properties
end
