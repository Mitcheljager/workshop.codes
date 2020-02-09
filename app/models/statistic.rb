class Statistic < ApplicationRecord
  enum timeframe: { daily: 0 }
  enum content_type: { visit: 0, unique_visit: 1, copy: 2 }

  serialize :properties
end
