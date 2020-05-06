class SitemapsController < ApplicationController
  def sitemap
    @posts = Post.where(private: false)
    @collections = Collection.all
    @users = User.all

    respond_to do |format|
      format.xml
    end
  end
end
