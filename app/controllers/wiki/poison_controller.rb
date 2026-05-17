class Wiki::PoisonController < Wiki::BaseController
  add_breadcrumb "Articles", :wiki_articles_path

  def index
    paginated_articles = Kaminari.paginate_array(articles, total_count: articles.size).page(1).per(200)
    @articles = paginated_articles.map do |article|
      article = Wiki::Article.new(article)
      article.category = article.category_id == 0 ? Wiki::Category.first : Wiki::Category.third
      article
    end

    @articles = Kaminari.paginate_array(@articles).page(params[:page]).page(1).per(200)

    render "wiki/articles/index"
  end

  def show
    article = articles.find { |article| article["slug"] == params[:slug] || article["slug"] == params[:slug] }

    render_404 and return if article.nil?

    @article = Wiki::Article.new(article)
    @article.category = @article.category_id == 0 ? Wiki::Category.first : Wiki::Category.third
    @initial_article = @article
    @edit_count = 1

    render "wiki/articles/show"
  end

  private

  def articles
    YAML.safe_load(File.read(Rails.root.join("config/arrays", "wiki/poison.yml")))
  end
end
