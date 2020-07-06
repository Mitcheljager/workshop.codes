class Wiki::ArticlesController < Wiki::BaseController
  add_breadcrumb "Articles", :wiki_articles_path

  before_action only: [:new, :create, :edit, :update, :destroy] do
    redirect_to wiki_root_path unless is_arbiter?(current_user)
  end

  def index
    @articles = Wiki::Article.approved.group(:group_id).maximum(:id).values
    @articles = Wiki::Article.approved.where(id: @articles).order(created_at: :desc).page(params[:page])
  end

  def show
    @article = Wiki::Article.approved.where(slug: params[:slug]).last

    not_found and return unless @article
    redirect_to_latest_article

    @initial_article = Wiki::Article.approved.where(group_id: @article.group_id).first

    @edit_ids = Wiki::Article.joins(:edit).approved.where(group_id: @article.group_id).pluck(:"wiki_edits.id")
    @edit_count = Wiki::Edit.where(id: @edit_ids).size

    add_breadcrumb "Categories", :wiki_categories_path
    add_breadcrumb @article.category.title, Proc.new{ wiki_category_path(@article.category.slug) }
    add_breadcrumb @article.title.truncate(20), Proc.new{ wiki_article_path(@article.slug) }
  end

  def new
    @article = Wiki::Article.new

    add_breadcrumb "New article", :new_wiki_article_path
  end

  def create
    create_new_article(random_string)

    if @article.save
      create_wiki_edit(:created, @article.id)

      if @article.edit.approved?
        redirect_to wiki_article_path(@article.slug)
      else
        redirect_to wiki_articles_path
      end
    else
      render :new
    end
  end

  def edit
    @article = Wiki::Article.where(slug: params[:slug]).last

    add_breadcrumb "Categories", :wiki_categories_path
    add_breadcrumb @article.category.title, Proc.new{ wiki_category_path(@article.category.slug) }
    add_breadcrumb @article.title.truncate(20), Proc.new{ wiki_article_path(@article.slug) }
    add_breadcrumb "Edit", Proc.new{ edit_wiki_article_path(@article.slug) }
  end

  def update
    @current_article = Wiki::Article.find(params[:slug])

    create_new_article(@current_article.group_id)

    if @article.save
      create_wiki_edit(:edited, @article.id, article_params[:edit_notes])
      redirect_to wiki_article_path(@article.slug)
    else
      render :edit
    end
  end

  def destroy
    @article = Wiki::Article.find(params[:slug])

    @article.destroy

    redirect_to wiki_articles_url
  end

  private

  def create_new_article(group_id)
    @article = Wiki::Article.new(article_params)
    @article.group_id = group_id
    @article.slug = title_to_slug
  end

  def article_params
    params.require(:wiki_article).permit(:title, :subtitle, :content, :tags, :category_id, :edit_notes)
  end

  def random_string
    SecureRandom.urlsafe_base64
  end

  def title_to_slug
    slug = CGI.escape(@article.title).gsub(".", "-").downcase
    if Wiki::Article.where.not(group_id: @article.group_id).where(slug: slug).any?
      return "#{ slug }-#{ random_string }"
    else
      return slug
    end
  end

  def redirect_to_latest_article
    @latest_article = Wiki::Article.approved.where(group_id: @article.group_id).last

    if @latest_article != @article
      redirect_to wiki_article_path(@latest_article.slug)
    end
  end

  def create_wiki_edit(content_type, article_id, notes = "")
    Wiki::Edit.create(
      user_id: current_user.id,
      content_type: content_type,
      article_id: article_id,
      notes: notes,
      approved: is_arbiter?(current_user)
    )
  end
end
