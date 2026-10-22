task add_model_id_to_ahoy_events: :environment do
  Ahoy::Event.where(model_id: nil).each do |event|
    id = event.properties.dig(:request, "id") || event.properties.dig(:request, :id) || event.properties["id"] || event.properties[:id]
    event.update_column(:model_id, id) if id.present?
  end
end
