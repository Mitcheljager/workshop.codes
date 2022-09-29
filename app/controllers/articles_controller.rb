class ArticlesController < ApplicationController
  before_action only: [:new, :create, :edit, :update, :destroy] do
    redirect_to root_path unless is_admin?(current_user)
  end

  def show
    @article = Article.find_by_slug(params[:slug])
  end

  def new
    @article = Article.new
  end

  def edit
    @article = Article.find_by_slug(params[:slug])
  end

  def create
    @article = Article.new(article_params)
    @article.slug = CGI.escape(@article.title).gsub(".", "-").downcase

    if @article.save
      flash[:notice] = "Article successfully created"
      redirect_to article_path(@article.slug)
    else
      render :new
    end
  end

  def update
    @article = Article.find_by_slug(params[:slug])

    if @article.update(article_params)
      flash[:notice] = "Article successfully updated"
      redirect_to article_path(@article.slug)
    else
      render :edit
    end
  end

  private

  def article_params
    params.require(:article).permit(:title, :content, :cover_image, images: [])
  end
end
