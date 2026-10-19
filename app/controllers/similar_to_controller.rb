class SimilarToController < ApplicationController
  def show
    @post = Post.find(params[:id])

    ids = Rails.cache.fetch("similar_to/#{@post.id}}", expires_in: 1.day) do
      ENV["BONSAI_URL"] ? Post.search(@post.tags.presence || @post.title, size: 4) : Post.last(3).pluck(:id)
    end

    @posts = Post.includes(:user).where(id: ids).where.not(id: @post.id).public?.select_overview_columns.limit(3)

    if @posts.any?
      render collection: @posts, partial: "posts/card", as: :post
    else
      render plain: "No similar codes were found"
    end
  end
end
