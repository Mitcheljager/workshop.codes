class Wiki::SearchController < Wiki::BaseController
  add_breadcrumb "Search", :wiki_articles_path

  def query
    unless params[:query].empty?
      respond_to do |format|
        format.js { redirect_to wiki_search_results_path(params[:query].gsub(".", "")) }
        format.html { redirect_to wiki_search_results_path(params[:query].gsub(".", "")) }
      end
    else
      redirect_back fallback_location: root_path
    end
  end

  def index
    ids = Wiki::Article.search(params[:query])
    articles = Wiki::Article.where(id: ids)
    groups = articles.map { |article| article.group_id }.uniq
    latest_articles = Wiki::Article.where(group_id: groups).group(:group_id).maximum(:id).values
    @articles = Wiki::Article.where(id: latest_articles).order_by_ids(ids)

    respond_to do |format|
      format.html
      format.json {
        @articles.each do |article|
          if params[:parse_markdown]
            article.content = sanitized_markdown(article.content)
          else
            article.content = ReverseMarkdown.convert(ActionController::Base.helpers.sanitize(markdown(article.content || ""), tags: %w(style p br strong em b blockquote h1 h2 h3 h4 h5 h6 code pre)).gsub(/h\d/, "strong"))
          end
        end

        set_request_headers

        if params[:single]
          render json: @articles.first.to_json(include: :category)
        else
          render json: @articles.to_json(include: :category)
        end
      }
    end
  end
end
