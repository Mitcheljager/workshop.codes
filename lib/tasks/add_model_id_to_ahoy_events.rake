task add_model_id_to_ahoy_events: :environment do
  Ahoy::Event.where(model_id: nil).each do |event|
    next unless event.properties[:request].present?

    id = event.properties[:request]["id"] || event.properties[:request][:id]
    event.update_column(:model_id, id) if id
  end
end
