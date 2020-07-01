require 'test_helper'
require 'capybara/rails'
require 'capybara/minitest'

class Wiki::BaseControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL

  setup do
    @categories = wiki_categories
    @articles = wiki_articles
    @article = wiki_articles(:article_one)
  end

  test "should get index" do
    visit wiki_root_url

    assert page.has_content? "Overwatch Workshop Wiki"

    assert page.has_content? wiki_categories(:category_one).title
    assert page.has_content? wiki_categories(:category_two).title
  end
end
