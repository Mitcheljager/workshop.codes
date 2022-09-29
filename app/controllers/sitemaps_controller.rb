class SitemapsController < ApplicationController
  def sitemap
    @posts = Post.visible?
    @collections = Collection.all
    @wiki_articles = Wiki::Article.approved.group(:group_id).maximum(:id).values
    @wiki_articles = Wiki::Article.approved.where(id: @wiki_articles)
    @wiki_categories = Wiki::Category.all
    @articles = Article.all

    respond_to do |format|
      format.xml
    end
  end
end
