require 'test_helper'
require 'capybara/rails'
require 'capybara/minitest'

class WhileYouWaitsControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL

  setup do
    @posts = posts
    @post = posts(:post_one)

    @while_you_waits = while_you_waits
  end

  test "should get index" do
    visit while_you_wait_url

    assert page.has_content? "While You Wait"

    assert page.has_content? posts(:post_one).title
    assert page.has_content? posts(:post_two).title
  end
end
