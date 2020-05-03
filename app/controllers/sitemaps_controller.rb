class SitemapsController < ApplicationController
  def sitemap
    @posts = Post.where(private: false)

    respond_to do |format|
      format.xml
    end
  end
end
