class Wiki::EditsController < Wiki::BaseController
  add_breadcrumb "Edits", :wiki_edits_path

  def index
    @edits = Wiki::Edit.order(created_at: :desc).page(params[:page])
  end

  def article
    @edits = Wiki::Edit.joins(:article).where("wiki_articles.group_id": params[:group_id]).order(created_at: :desc).page(params[:page])

    add_breadcrumb params[:group_id], Proc.new { wiki_article_edits_path(params[:group_id]) }
  end

  def show
    @edit = Wiki::Edit.find(params[:id])
    @previous_article = Wiki::Article.where(group_id: @edit.article.group_id).where("id < ?", @edit.article.id).last

    not_found if @previous_article.nil?

    if @edit.content_type == "edited"
      @title_difference = Diffy::SplitDiff.new(@previous_article.title, @edit.article.title, format: :html, allow_empty_diff: false)
      @slug_difference = Diffy::SplitDiff.new(@previous_article.slug, @edit.article.slug, format: :html, allow_empty_diff: false)
      @content_difference = Diffy::SplitDiff.new(@previous_article.content, @edit.article.content, format: :html, allow_empty_diff: false)
      @category_difference = Diffy::SplitDiff.new(@previous_article.category.title, @edit.article.category.title, format: :html, allow_empty_diff: false)
      @tags_difference = Diffy::SplitDiff.new(@previous_article.tags || "", @edit.article.tags || "", format: :html, allow_empty_diff: false)
    end

    add_breadcrumb @edit.article.group_id, Proc.new { wiki_article_edits_path(@edit.article.group_id) }
    add_breadcrumb @edit.id, Proc.new { wiki_edit_path(@edit) }
  end

  private

  def not_found
    raise ActionController::RoutingError.new("Not Found")
  end
end
