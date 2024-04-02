require 'rails_helper'
require 'rails_helper'
require './spec/support/user_helpers'

RSpec.configure do |c|
  c.include Helpers::Users
end

RSpec.feature "Comments", type: :feature do
  include Capybara::DSL

  let!(:post_author) { create(:user) }
  let!(:comment_author) { create(:user, password: "password") }
  let!(:post) { create(:post, user_id: post_author.id) }

  context "creation", js: true do
    before(:each) do
      sign_in_as(comment_author, "password")
      visit post_tab_path(code: post.code, tab: "comments")
    end

    # it "is allowed for non-empty comments" do
    #   fill_in "comment_content", with: "A non-empty comment"
    #   # Do not expect HTML5 validation message
    #   expect(page).not_to have_field("comment_content", validation_message: /Please fill out this field/)

    #   find(".comment-form").click_on "Comment"

    #   within(".comments") do
    #     expect(page).to have_text("A non-empty comment")
    #   end
    # end

    # it "is not allowed for empty comments" do
    #   # Expect an HTML5 validation message
    #   expect(page).to have_field("comment_content", validation_message: /Please fill out this field/)
    # end

    # it "is rejected on the backend when full of whitespace" do
    #   fill_in "comment_content", with: "    "

    #   find(".comment-form").click_on "Comment"

    #   # FIXME: JSON results are not found as expected, could be related to Svelte component
    #   # json_div = page.find('div[data-svelte-component="Alerts"]')
    #   # expect(json_div).to have_json_property("data-svelte-props", "Something went wrong when performing that action.")
    # end
  end
end
