class Wiki::CategoriesController < Wiki::BaseController
  add_breadcrumb "Articles", :wiki_articles_path
  add_breadcrumb "Categories", :wiki_categories_path

  before_action only: [:new, :create, :edit, :update, :destroy] do
    redirect_to wiki_root_path unless is_arbiter?(current_user)
  end

  def index
    @categories = Wiki::Category.order(title: :asc)
  end

  def show
    @category = Wiki::Category.find_by_slug!(params[:slug])

    @articles = Wiki::Article.approved.where(category: @category).group(:group_id).maximum(:id).values
    @articles = Wiki::Article.approved.where(id: @articles).order(title: :asc).page(params[:page])

    add_breadcrumb @category.title, Proc.new{ wiki_category_path(@category.slug) }

    respond_to do |format|
      format.html
      format.js { render "wiki/articles/infinite_scroll_articles" }
    end
  end

  def new
    @category = Wiki::Category.new
  end

  def create
    @category = Wiki::Category.new(category_params)
    @category.slug = category_params[:title].downcase.gsub(" ", "-").gsub(".", "-")

    if @category.save
      redirect_to wiki_categories_path
    else
      render file: "application/error.js.erb"
    end
  end

  def edit
    @category = Wiki::Category.find_by_slug!(params[:slug])
  end

  def update
    @category = Wiki::Category.find(params[:slug])
    params[:wiki_category][:slug] = category_params[:title].downcase.gsub(" ", "-").gsub(".", "-")

    if @category.update(category_params)
      redirect_to wiki_category_path(@category.slug)
    else
      render file: "application/error.js.erb"
    end
  end

  def destroy
    @category = Wiki::Category.find(params[:slug])

    return if @category.articles.count > 0

    @category.destroy

    redirect_to wiki_categories_url
  end

  private

  def category_params
    params.require(:wiki_category).permit(:title, :slug, :description, :is_documentation)
  end
end
