class Ahoy::Event < ApplicationRecord
  include Ahoy::QueryMethods

  self.table_name = "ahoy_events"

  belongs_to :visit
  belongs_to :user, optional: true

  serialize :properties

  before_validation do
    self.model_id = self.properties.dig(:request, :id) || self.properties[:id]
  end
end
