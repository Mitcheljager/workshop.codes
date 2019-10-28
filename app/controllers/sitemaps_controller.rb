class SitemapsController < ApplicationController
  def sitemap
    @posts = Post.all
    @snippets = Snippet.all

    respond_to do |format|
      format.xml
    end
  end
end
