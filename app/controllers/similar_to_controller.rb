class SimilarToController < ApplicationController
  def show
    @post = Post.find(params[:id])

    if ENV["BONSAI_URL"]
      @posts = Post.includes(:user).where(id: Post.search(@post.tags.presence || @post.title, size: 4, bypass_cache: false)).where.not(id: @post.id).select_overview_columns.public?.limit(3)
    else
      @posts = Post.where.not(id: @post.id).last(3)
    end

    if @posts.any?
      render collection: @posts, partial: "posts/card", as: :post
    else
      render plain: "No similar posts were found"
    end
  end
end
