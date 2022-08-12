require 'rails_helper'


# Checking actual page content requires full browser engine, which is too expensive to be worth on its own at the moment.
RSpec.describe "Profiles", type: :feature do
  let!(:user) { create(:user) }
  let!(:posts) { create_list(:post, 30, user_id: user.id) }

  describe "page default behavior" do
    it "selects the highlights tab by default if the user has a block" do
      create(:block, user_id: user.id, content_type: :profile, name: "highlight", properties: ActionController::Parameters.new({post: "#{posts.first.id}", description: "This is a highlight"}))

      visit profile_path( user.username )
      expect(page).to have_link("Highlights", class: "tabs__item--active")
      expect(page).not_to have_link("Codes", class: "tabs__item--active")
    end

    it "shows the user's posts if they have no blocks" do
      visit profile_path( user.username )
      expect(page).to have_link("Codes", class: "tabs__item--active")
      expect(page).not_to have_link("Highlights", class: "tabs__item--active")

      # Check page content
      expect(page).not_to have_link("Highlights", class: "tabs__item")
      expect(page).not_to have_content("This is a highlight")
      expect(page).to have_content(posts.last.title)
      expect(page).to have_content(posts.last.code)
    end

    it "performs an infinite scroll on the user's posts", js: true do
      visit profile_path( user.username )
      expect(page).to have_link("Codes", class: "tabs__item--active")

      # Show most recent posts
      # Can check content here because we drive the test with Selenium
      # HACK: we assume the last post is the most recent
      expect(page).to have_content(posts.last.title)
      expect(page).to have_content(posts.last.code)
      expect(page).to have_content(posts.last.user.username)

      # Don't show older posts
      # HACK: we assume that the first post is on the next page (due to page size of 20)
      expect(page).not_to have_content(posts.first.title)
      expect(page).not_to have_content(posts.first.code)

      # Scroll down to the bottom of the page
      page.execute_script('window.scrollTo(0, document.body.scrollHeight)')

      # Show older posts
      expect(page).to have_content(posts.first.title)
      expect(page).to have_content(posts.first.code)
    end
  end

  describe "page responds to tab query param" do
    it "selects the codes tab even if the user has a block" do
      create(:block, user: user, name: "highlight", properties: "{post: #{posts.first.id}, description: }")

      visit profile_path( user.username , params: { tab: "codes" })
      expect(page).to have_link("Codes", class: "tabs__item--active")
      expect(page).not_to have_link("Highlights", class: "tabs__item--active")
    end

    it "selects the collections tab" do
      visit profile_path( user.username , params: { tab: "collections" })
      expect(page).to have_link("Collections", class: "tabs__item--active")
      expect(page).not_to have_link("Codes", class: "tabs__item--active")
      expect(page).not_to have_link("Highlights", class: "tabs__item--active")
    end
  end
end
