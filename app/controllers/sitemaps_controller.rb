class SitemapsController < ApplicationController
  def sitemap
    @post = Post.select_overview_columns.public?.order(created_at: :desc).first
    @wiki_categories = Wiki::Category.all
    @articles = Article.all

    respond_to do |format|
      format.xml
    end
  end
end
