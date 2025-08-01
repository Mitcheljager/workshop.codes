require "test_helper"
require "capybara/rails"
require "capybara/minitest"

class Wiki::ArticleControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL

  setup do
    @article = wiki_articles(:article_one)
  end

  test "should get index" do
    visit wiki_articles_url

    assert page.has_content? "Wiki Articles"
  end

  test "User should be able to navigate to new article path and create a new article" do
    sign_in_as users(:user_one)

    visit wiki_articles_url

    assert page.has_content? /NEW ARTICLE/i

    visit new_wiki_article_path

    save_and_open_page

    assert page.has_content? "Create new Wiki Article"

    fill_in "wiki_article_title", with: @article.title
    fill_in "wiki_article_content", with: @article.content
    fill_in "wiki_article_tags", with: @article.tags

    find("#wiki_article_category_id option:nth-child(2)").select_option

    assert_difference "Wiki::Article.count", 1 do
      click_button "Submit"
    end
  end
end
