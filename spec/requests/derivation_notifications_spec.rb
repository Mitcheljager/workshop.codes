require 'rails_helper'
require "./spec/support/user_helpers"
require "./spec/support/post_helpers"
require "capybara/rails"

RSpec.configure do |c|
  c.include Helpers::Users
  c.include Helpers::Posts
end

RSpec.describe "DerivationNotifications", type: :request do
  include Capybara::DSL
  let!(:user1) { create(:user, password: "password")}
  let!(:user2) { create(:user, password: "password")}
  let(:posts1) { create_list(:post, 10, user_id: user1.id) }
  let(:posts2) { create_list(:post, 10, user_id: user2.id) }

  describe "POST /new" do
    before(:each) do
      get "/"
      sign_in_as user1
    end

    it "sends a notification when the post is public", js: true do
      expect do
        visit new_post_path

        fill_in_post_form
        check id: "show_derivative", allow_label_click: true
        page.execute_script "document.getElementById('post_derivatives').value = '#{ posts2.first.code }';"

        click_on "Save"
      end.to change { user2.notifications.count }.by 1
    end

    it "does not send a notification when the post is private", js: true do
      expect do
        visit new_post_path

        fill_in_post_form
        click_on "Settings"
        choose "Private"
        check id: "show_derivative", allow_label_click: true
        page.execute_script "document.getElementById('post_derivatives').value = '#{ posts2.first.code }';"

        click_on "Save"
      end.to change { user2.notifications.count }.by 0
    end

    it "does not send a notification when the post is unlisted", js: true do
      expect do
        visit new_post_path

        fill_in_post_form
        click_on "Settings"
        choose "Unlisted"
        check id: "show_derivative", allow_label_click: true
        page.execute_script "document.getElementById('post_derivatives').value = '#{ posts2.first.code }';"

        click_on "Save"
      end.to change { user2.notifications.count }.by 0
    end

    it "does not send a notification when the post is a draft", js: true do
      expect do
        visit new_post_path

        fill_in_post_form
        click_on "Settings"
        choose "Draft"
        check id: "show_derivative", allow_label_click: true
        page.execute_script "document.getElementById('post_derivatives').value = '#{ posts2.first.code }';"

        click_on "Save"
      end.to change { user2.notifications.count }.by 0
    end

    it "does send a notification when the post was a draft and is now public", js: true do
      expect do
        visit new_post_path

        fill_in_post_form
        click_on "Settings"
        choose "Draft"
        check id: "show_derivative", allow_label_click: true
        page.execute_script "document.getElementById('post_derivatives').value = '#{ posts2.first.code }';"
        page.save_screenshot
        click_on "Save"
        visit edit_post_path(code: Post.last.code)

        click_on "Settings"
        choose "Public"

        click_on "Save"
      end.to change { user2.notifications.count }.by 1
    end
  end
end
