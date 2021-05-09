require 'test_helper'
require 'capybara/rails'
require 'capybara/minitest'

class PostsControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL

  setup do
    @posts = posts
    @post = posts(:post_one)
  end

  test "should get index" do
    visit posts_url

    assert page.has_content? "On Fire Codes"
    assert page.has_content? "Latest Codes"

    assert page.has_content? posts(:post_one).title
    assert page.has_content? posts(:post_two).title
  end

  test "User should be able to navigate to new post path and create a new post" do
    sign_in_as users(:user_one)

    visit new_post_url(nil)

    assert page.has_content? "Create new"

    code = SecureRandom.alphanumeric(5)

    fill_in "post_title", with: @post.title
    fill_in "post_code", with: SecureRandom.alphanumeric(5)
    fill_in "post_description", with: @post.description
    fill_in "post_tags", with: @post.tags
    fill_in "post_version", with: @post.version

    find("#post_categories").find("option[value='Team Deathmatch']").select_option
    find("#post_heroes_reinhardt").set(true)
    find("#post_maps_hanamura").set(true)
    find("#post_min_players", visible: false).set(1)
    find("#post_max_players", visible: false).set(12)

    assert_difference "Post.count", 1 do
      click_button "Create Post"
    end
  end

  test "User can visit post" do
    visit post_url(@post.code)

    assert page.has_content? @post.title
    assert page.has_content? @post.code

    find(".copy-trigger").click
  end

  test "User can edit their post" do
    sign_in_as users(:user_one)

    visit post_url(@post.code)
    assert page.has_content? @post.title
    click_link "Edit"

    assert page.has_content? "Editing"
    fill_in "post_title", with: "Edited post title"

    click_button "Update Post"
  end

  test "User can destroy their post" do
    sign_in_as users(:user_one)

    visit account_posts_path
    assert page.has_content? "Delete"

    assert_difference "Post.count", -1 do
      first(".item--small").click_link "Delete"
    end
  end
end
