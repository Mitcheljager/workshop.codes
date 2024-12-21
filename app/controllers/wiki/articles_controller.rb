class Wiki::ArticlesController < Wiki::BaseController
  add_breadcrumb "Articles", :wiki_articles_path

  before_action only: [:new, :create, :edit, :update] do
    redirect_to login_path unless current_user.present?
  end

  before_action only: [:destroy] do
    redirect_to wiki_root_path unless is_arbiter?(current_user)
  end

  def index
    @articles = Wiki::Article.group(:group_id).maximum(:id).values
    @articles = Wiki::Article.where(id: @articles).order(created_at: :desc).page(params[:page])

    respond_to do |format|
      format.html
      format.js { render "wiki/articles/infinite_scroll_articles" }
    end
  end

  def show
    @article = Wiki::Article.where(slug: params[:slug]).last

    not_found and return unless @article

    latest_article = Wiki::Article.where(group_id: @article.group_id).last

    # Redirect to the latest article within the same group if it's a HTML request
    # Render the JSON for the latest article if it's a JSON request
    if latest_article != @article
      respond_to do |format|
        format.html { redirect_to wiki_article_path(latest_article.slug) and return }
        format.json {
          latest_article.readonly!
          latest_article.content = sanitized_markdown(latest_article.content) if params[:parse_markdown]
          render json: latest_article.to_json(include: :category) and return
        }
      end
    end

    @initial_article = Wiki::Article.where(group_id: @article.group_id).first

    @edit_ids = Wiki::Article.joins(:edit).where(group_id: @article.group_id).pluck(:"wiki_edits.id")
    @edit_count = Wiki::Edit.where(id: @edit_ids).size

    @article.readonly!
    @article.content = sanitized_markdown(@article.content) if params[:parse_markdown]

    add_breadcrumb "Categories", :wiki_categories_path
    add_breadcrumb @article.category.title, Proc.new{ wiki_category_path(@article.category.slug) }
    add_breadcrumb @article.title.truncate(20), Proc.new{ wiki_article_path(@article.slug) }

    respond_to do |format|
      format.html
      format.json { render json: @article.to_json(include: :category) }
    end
  end

  def new
    @article = Wiki::Article.new

    add_breadcrumb "New article", :new_wiki_article_path
  end

  def create
    create_new_article(random_string)

    if @article.save
      create_wiki_edit(:created, @article.id)
      create_activity(:create_wiki_article, { id: @article.id })

      if @article
        BadgesWikiJob.perform_async(current_user)
        flash[:notice] = "Article successfully created"
        redirect_to wiki_article_path(@article.slug)
      else
        redirect_to wiki_articles_path
      end
    else
      respond_to do |format|
        format.html { render :new }
        format.js { render "validation" }
      end
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
    create_activity(:update_wiki_article, { id: @article.id })

    if @article.save
      BadgesWikiJob.perform_async(current_user)
      create_wiki_edit(:edited, @article.id, article_params[:edit_notes])
      redirect_to wiki_article_path(@article.slug)
    else
      respond_to do |format|
        format.html { render :edit }
        format.js { render "validation" }
      end
    end
  end

  def destroy
    @article = Wiki::Article.find(params[:slug])
    @articles = Wiki::Article.where(group_id: @article.group_id)

    @articles.destroy_all

    redirect_to wiki_articles_url
  end

  private

  def create_new_article(group_id)
    @article = Wiki::Article.new(article_params)
    @article.group_id = group_id
    @article.slug = title_to_slug
  end

  def article_params
    params.require(:wiki_article).permit(:title, :subtitle, :content, :tags, :category_id, :edit_notes, images: [], videos: [])
  end

  def random_string
    SecureRandom.urlsafe_base64
  end

  def title_to_slug
    slug = CGI.escape(@article.title.gsub(/[^0-9a-z ]/i, "").parameterize).gsub("+", "-").downcase
    if Wiki::Article.where.not(group_id: @article.group_id).where(slug: slug).any?
      return "#{ slug }-#{ random_string }"
    else
      return slug
    end
  end

  def redirect_to_latest_article

  end

  def create_wiki_edit(content_type, article_id, notes = "")
    Wiki::Edit.create(
      user_id: current_user.id,
      content_type: content_type,
      article_id: article_id,
      notes: notes,
      approved: true
    )
  end
end
