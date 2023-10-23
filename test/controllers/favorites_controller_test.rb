require 'test_helper'

class FavoritesControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL

  test "a logged out user should be redirected when pressing favorite" do
    visit posts_url

    first(".item").find(".favorite").click
  end
end
