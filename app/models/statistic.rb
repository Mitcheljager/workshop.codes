class Statistic < ApplicationRecord
  enum timeframe: { daily: 0 }

  serialize :properties
end
