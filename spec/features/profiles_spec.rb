require 'rails_helper'

require "./spec/support/user_helpers"

RSpec.configure do |c|
  c.include Helpers::Users
end

# Checking actual page content requires full browser engine, which is too expensive to be worth on its own at the moment.
RSpec.describe "Profiles", type: :feature do
  let!(:user) { create(:user, password: "password123") }
  let!(:posts) { create_list(:post, 30, user_id: user.id) }

  describe "page default behavior" do
    it "selects the highlights tab by default if the user has a block" do
      create(:block, user_id: user.id, content_type: :profile, name: "highlight", properties: ActionController::Parameters.new({post: "#{posts.first.id}", description: "This is a highlight"}))

      visit profile_path(username: user.username )
      expect(page).to have_link("Highlights", class: "tabs__item--active")
      expect(page).not_to have_link("Codes", class: "tabs__item--active")
    end

    it "shows the user's posts if they have no blocks" do
      visit profile_path(username: user.username )
      expect(page).to have_link("Codes", class: "tabs__item--active")
      expect(page).not_to have_link("Highlights", class: "tabs__item--active")

      # Check page content
      expect(page).not_to have_link("Highlights", class: "tabs__item")
      expect(page).not_to have_content("This is a highlight")
      expect(page).to have_content(posts.last.title)
      expect(page).to have_content(posts.last.code)
    end

    # it "performs an infinite scroll on the user's posts", js: true do
    #   visit profile_path(username: user.username)
    #   expect(page).to have_link("Codes", class: "tabs__item--active")

    #   # Show most recent posts
    #   # Can check content here because we drive the test with Selenium
    #   # HACK: we assume the last post is the most recent
    #   expect(page).to have_content(posts.last.title)
    #   expect(page).to have_content(posts.last.code)
    #   expect(page).to have_content(posts.last.user.username)

    #   # Don't show older posts
    #   # HACK: we assume that the first post is on the next page (due to page size of 18)
    #   expect(page).not_to have_content(posts.first.title)
    #   expect(page).not_to have_content(posts.first.code)

    #   # Scroll down to the bottom of the page
    #   page.execute_script('window.scrollTo(0, document.body.scrollHeight)')

    #   # Show older posts
    #   expect(page).to have_content(posts.first.title)
    #   expect(page).to have_content(posts.first.code)
    # end
  end

  describe "page responds to tab query param" do
    it "selects the codes tab even if the user has a block" do
      create(:block, user: user, name: "highlight", properties: "{post: #{posts.first.id}, description: }")

      visit profile_path(username: user.username , params: { tab: "codes" })
      expect(page).to have_link("Codes", class: "tabs__item--active")
      expect(page).not_to have_link("Highlights", class: "tabs__item--active")
    end

    it "selects the collections tab" do
      visit profile_path(username: user.username , params: { tab: "collections" })
      expect(page).to have_link("Collections", class: "tabs__item--active")
      expect(page).not_to have_link("Codes", class: "tabs__item--active")
      expect(page).not_to have_link("Highlights", class: "tabs__item--active")
    end
  end

  describe "page manages profile images", js: true do
    before(:all) do
      @file_fixture_path = Rails.root + "test/fixtures/files/"
      @example_profile_image = "example_profile_image.png"
      @example_banner_image  = "example_profile_banner.jpg"
    end

    before(:each) do
      sign_in_as(user, "password123")
      visit edit_profile_path
      click_on "Images"
    end

    context "when adding images" do
      # it "allows uploading a profile image" do
      #   attach_file("user_profile_image", @file_fixture_path + @example_profile_image)

      #   expect {
      #     click_on "Save"
      #     user.reload
      #   }.to change { user.profile_image.attached? }.from(false).to(true)
      #   .and not_change { user.banner_image.attached? }

      #   # FIXME: JSON results are not found as expected, could be related to Svelte component
      #   # json_div = page.find('div[data-svelte-component="Alerts"]')
      #   # expect(json_div).to have_json_property("data-svelte-props", "Successfully saved")
      # end

      # it "allows uploading a banner image" do
      #   attach_file("user_banner_image", @file_fixture_path + @example_banner_image)

      #   expect {
      #     click_on "Save"
      #     user.reload
      #   }.to change { user.banner_image.attached? }.from(false).to(true)
      #   .and not_change { user.profile_image.attached? }

      #   # FIXME: JSON results are not found as expected, could be related to Svelte component
      #   # json_div = page.find('div[data-svelte-component="Alerts"]')
      #   # expect(json_div).to have_json_property("data-svelte-props", "Successfully saved")
      # end

      # it "allows uploading both images at once" do
      #   attach_file("user_profile_image", @file_fixture_path + @example_profile_image)
      #   attach_file("user_banner_image", @file_fixture_path + @example_banner_image)

      #   expect {
      #     click_on "Save"
      #     user.reload
      #   }.to change { user.profile_image.attached? }.from(false).to(true)
      #   .and change { user.banner_image.attached? }.from(false).to(true)
      # end
    end

    context "when removing images" do
      # before(:each) do
      #   user.profile_image.attach(io: File.open(@file_fixture_path + @example_profile_image), filename: @example_profile_image)
      #   user.banner_image.attach( io: File.open(@file_fixture_path + @example_banner_image),  filename: @example_banner_image)
      #   user.save! # Probably not necessary, but included for safety
      # end

      # it "allows removal of the profile image" do
      #   expect {
      #     find("#user_profile_image").find(:xpath, "..").click_on("Remove")
      #     click_on "Save"
      #     user.reload
      #   }.to change { user.profile_image.attached? }.from(true).to(false)
      #   .and not_change { user.banner_image.attached? }
      # end

      # it "allows removal of the banner image" do
      #   expect {
      #     find("#user_banner_image").find(:xpath, "..").click_on("Remove")
      #     click_on "Save"
      #     user.reload
      #   }.to change { user.banner_image.attached? }.from(true).to(false)
      #   .and not_change { user.profile_image.attached? }
      # end

      # it "allows removal of both images at once" do
      #   expect {
      #     find("#user_profile_image").find(:xpath, "..").click_on("Remove")
      #     find("#user_banner_image").find(:xpath, "..").click_on("Remove")
      #     click_on "Save"
      #     user.reload
      #   }.to change { user.profile_image.attached? }.from(true).to(false)
      #   .and change { user.banner_image.attached? }.from(true).to(false)
      # end
    end
  end
end
