class DerivativesController < ApplicationController
  def derived_from
    @post = Post.find(params[:post_id])
    @posts = @post.derivations

    render partial: "derived_from"
  end
end
