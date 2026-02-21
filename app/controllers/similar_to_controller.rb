class SimilarToController < ApplicationController
  def show
    @post = Post.find(params[:id])
    @posts = ENV["BONSAI_URL"] ?
      Post.includes(:user).where(id: Post.search(@post.tags.presence || @post.title, size: 4, bypass_cache: false)).where.not(id: @post.id).select_overview_columns.public?.limit(3) :
      Post.where.not(id: @post.id).last(3)

    if @posts.any?
      render collection: @posts, partial: "posts/card", as: :post
    else
      render plain: "No similar posts were found"
    end
  end
end
