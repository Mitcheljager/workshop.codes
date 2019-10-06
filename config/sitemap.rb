SitemapGenerator::Sitemap.default_host = "https://www.workshop.codes"
SitemapGenerator::Sitemap.create do
  add "/", changefreq: "daily", priority: 0.9
  add "/snippets", priority: 0.8
  add "/login", priority: 0.8
  add "/register", priority: 0.8
  add "/on-fire", priority: 0.8

  Post.find_each do |post|
    add post_path(post.code), lastmod: post.updated_at, priority: 0.7
  end

  Snippet.find_each do |snippet|
    add snippet_path(snippet.unique_id), lastmod: snippet.updated_at, priority: 0.7
  end

  categories.each do |category|
    add category_path(to_slug(category)), priority: 0.6
  end

  heroes.each do |hero|
    add hero_path(to_slug(hero["name"])), priority: 0.6
  end

  maps.each do |map|
    add map_path(to_slug(map["name"])), priority: 0.6
  end
end
