class Wiki::DictionaryController < Wiki::BaseController
  def index
    @actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    @values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))

    merged_array = @actions.merge(@values)

    @dictionary = merged_array.map { |a| a[1]["en-US"] }

    set_request_headers
    render json: @dictionary.to_json, layout: false
  end

  private

  def set_request_headers
    headers["Access-Control-Allow-Origin"] = "*"
  end
end
