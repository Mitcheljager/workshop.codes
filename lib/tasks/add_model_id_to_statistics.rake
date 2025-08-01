desc "Add model_id to statistics that need an ID"
task add_model_id_to_statistics: :environment do
  @statistics = Statistic.all

  @statistics.each do |statistic|
    if statistic["properties"]["id"]
      statistic.update(model_id: statistic["properties"]["id"])
    end
  end
end
