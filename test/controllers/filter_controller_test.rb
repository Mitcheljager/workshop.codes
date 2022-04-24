require 'test_helper'
require 'capybara/rails'
require 'capybara/minitest'

class PostsControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL

  setup do
    @posts = posts
    @post = posts(:post_one)
    @post_overwatch_2 = posts(:post_overwatch_2)
  end

  test "When the overwatch_2 param is set show a standout on the filter overview page" do
    visit filter_url(overwatch_2: true)

    assert page.has_content? "Overwatch 2 Beta compatible codes"
  end
end
