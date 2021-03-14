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
    @articles = Wiki::Article.search(params[:query]).records

    @articles_ids = @articles.group(:group_id).maximum(:id).values
    @articles = @articles.approved.where(id: @articles_ids)

    respond_to do |format|
      format.html
      format.json {
        @articles.each do |article|
          article.content = ReverseMarkdown.convert(ActionController::Base.helpers.sanitize(markdown(article.content), tags: %w(style p br strong em b blockquote h1 h2 h3 h4 h5 h6 code pre)).gsub(/h\d/, "strong"))
        end

        set_request_headers
        render json: @articles.to_json(include: :category)
      }
    end
  end
end
