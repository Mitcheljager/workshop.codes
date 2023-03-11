require "rails_helper"
require "./spec/support/user_helpers"
require "./spec/support/post_helpers"

RSpec.configure do |c|
  c.include Helpers::Users
  c.include Helpers::Posts
end

RSpec.feature "Post Derivation Validation", type: :feature do
  include Capybara::DSL

  let!(:user) { create(:user, password: "password123") }
  let!(:post) { create(:post, user_id: user.id) }

  before(:each) do
    sign_in_as(user, "password123")
  end

  context "while creating a post", js: true do
    before(:each) do
      visit new_post_path
      @post_attrs = fill_in_post_form
      # Toggle post derivatives on
      page.find("[data-svelte-component='DerivativesForm'] label[for='show_derivative']").click
    end

    it "does not allow too many codes" do
      ["AJERA", "NNKWC", "1DMTZ", "TXCXX", "HHHPHB"].each do |code|
        add_code_as_source code
      end
      expect(find("[data-svelte-component='DerivativesForm'] input[type='text']").readonly?).to be true
    end

    it "does not allow using the same code as the post" do
      add_code_as_source @post_attrs[:code]
      click_on "Save"
      expect(page).not_to have_content "Post successfully created"
      expect(page).to have_content "Cannot derive from the same import code"
    end
  end
end

def add_code_as_source(code)
  page.find("[data-svelte-component='DerivativesForm'] input[type='text']").fill_in(with: "#{code},")
end
