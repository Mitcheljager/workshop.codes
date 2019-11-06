class SitemapsController < ApplicationController
  def sitemap
    @posts = Post.all
    @snippets = Snippet.where(private: 0)

    respond_to do |format|
      format.xml
    end
  end
end
