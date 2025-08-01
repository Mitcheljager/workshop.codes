desc "Upgrade wiki articles slugs from + to - for spaces"
task update_wiki_article_slugs: :environment do
  user = User.find_by_username("mitsiee")
  user = User.find_by_username("admin") unless user.present?

  articles_ids = Wiki::Article.group(:group_id).maximum(:id).values
  articles = Wiki::Article.where(id: articles_ids)

  articles.each do |article|
    new_slug = CGI.escape(article.title.gsub(/[^0-9a-z ]/i, "").parameterize).gsub("+", "-").downcase

    next if new_slug == article.slug

    puts "#{ article.slug } -> #{ new_slug }"

    article = Wiki::Article.create(
      title: article.title,
      subtitle: article.subtitle,
      slug: new_slug,
      group_id: article.group_id,
      content: article.content,
      category_id: article.category.id,
      tags: article.tags,
    )

    edit = Wiki::Edit.create(
      user_id: user.id,
      article_id: article.id,
      content_type: :edited,
      approved: true
    )
  end
end
