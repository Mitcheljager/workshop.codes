class ArticlesController < ApplicationController
  def show
  end

  def new
    @article = Article.new
  end

  def edit
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
    @article = Article.find(params[:slug])
  end

  private

  def article_params
    params.require(:article).permit(:title, :content, :cover_image, images: [])

    if @article.save
      redirect_to article_path(@article.slug)
    else
      render :edit
    end
  end
end
