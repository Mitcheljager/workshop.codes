class SitemapsController < ApplicationController
  def sitemap
    @posts = Post.all

    respond_to do |format|
      format.xml
    end
  end
end
