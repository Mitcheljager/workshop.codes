class Wiki::DictionaryController < Wiki::BaseController
  add_breadcrumb "Dictionary", :wiki_dictionary_path

  def index
    @actions = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    @values = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))

    merged_array = @actions + @values

    dictionary = merged_array.map { |a| a["en-US"] }.compact

    respond_to do |format|
      format.html
      format.json {
        set_request_headers
        render json: dictionary.to_json, layout: false
      }
    end
  end

  private

  def set_request_headers
    headers["Access-Control-Allow-Origin"] = "*"
  end
end
