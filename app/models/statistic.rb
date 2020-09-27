class Statistic < ApplicationRecord
  enum timeframe: { daily: 0, forever: 1 }
  enum content_type: { visit: 0, unique_visit: 1, copy: 2, search: 3 }

  serialize :properties
end
