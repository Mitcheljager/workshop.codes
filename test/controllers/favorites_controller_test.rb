require 'test_helper'

class FavoritesControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL

  test "a logged out user should be redirected when pressing favorite" do
    visit posts_url

    first(".item").find(".favorite").click

    assert page.has_content? "Login"
  end

  test "a logged in user should be able to press favorite and unfavorite" do
    sign_in_as users(:user_one)
    visit posts_url

    assert_difference "Favorite.count", 1 do
      first(".item").find(".favorite").click
    end

    assert_difference "Favorite.count", -1 do
      first(".item").find(".favorite").click
    end
  end
end
