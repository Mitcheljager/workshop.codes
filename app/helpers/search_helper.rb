module SearchHelper
  def build_search_path(key, value)
    parameters = {
      category: params[:category],
      hero: params[:hero],
      map: params[:map],
      sort: params[:sort],
      expired: params[:expired],
      author: params[:author],
      players: params[:players],
      search: params[:search]
    }

    parameters[key] = value

    if parameters.values.all? { |v| v.nil? }
      search_path(sort: :latest)
    else
      search_path(string_params(parameters))
    end
  end

  def is_filter_active?
    params[:sort] ||
    params[:expired] ||
    params[:map] ||
    params[:hero] ||
    params[:category] ||
    params[:author] ||
    params[:players]
  end
end
