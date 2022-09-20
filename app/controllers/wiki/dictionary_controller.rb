class Wiki::DictionaryController < Wiki::BaseController
  add_breadcrumb "Dictionary", :wiki_dictionary_path

  def index
    @actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    @values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))

    merged_array = @actions.merge(@values)

    @dictionary = merged_array.map { |a| a[1]["en-US"] }

    respond_to do |format|
      format.html { render "wiki/dictionary/index.html.erb" } # Automatic path doesn't work, possibly because of no plurals
      format.json {
        set_request_headers
        render json: @dictionary.to_json, layout: false
      }
    end
  end

  private

  def set_request_headers
    headers["Access-Control-Allow-Origin"] = "*"
  end
end
