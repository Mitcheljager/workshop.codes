Given "the following categories exist:" do |categories_table|
  categories_table.hashes.each do |category|
    next if category[:title].match? /:?-+:?/
    c = Wiki::Category.new(category)
    c.slug = to_slug(c.title)
    c.save
  end
end

Given('the following articles exist:') do |articles_table|
  create_articles(articles_table)
end

Given('I try to create (a )new wiki article(s):') do |table|
  table.hashes.each do |attributes|
    next if attributes[:title].match? /\A:?-+:?\z/
    visit new_wiki_article_path
    fill_in "wiki_article_title", with: attributes[:title]
    find("#wiki_article_category_id").select(attributes[:category])
    fill_in "wiki_article_content", with: attributes[:content]
    click_on 'Submit'
  end
end

Then('I should be viewing the wiki article titled {string}') do |title|
  article = Wiki::Article.find_by_title!(title)
  expect(current_path).to eq wiki_article_path(slug: article.slug)
end

def to_slug(string)
  string.to_s.downcase.gsub(" ", "-").gsub(":", "").gsub(".", "").gsub("'", "")
end

def create_articles(articles_table)
  articles_table.hashes.each do |article|
    next if article[:title].match? /\A:?-+:?\z/
    article["category"] = Wiki::Category.find_by_title!(article["category"])
    a = Wiki::Article.new(article)
    a.slug = to_slug(a.title)
    a.save
  end
end
