require 'rails_helper'

RSpec.feature "SearchAndFilters", type: :feature do
  include Capybara::DSL

  # Searching terms must be JavaScript-enabled to ensure that
  # the search box behaves exactly as it does on most browsers.
  context "search terms only", js: true do
    before(:each) do
      visit root_path
    end

    it "handles an alphabetic query" do
      query = "Normal alphabetic query"
      input_search_query(query)
      submit_search_form
      validate_search_query(query)
    end

    it "handles a query with special symbols" do
      query = "Query with w3r$d ch%rct.rs"
      input_search_query(query)
      submit_search_form
      validate_search_query(query)
    end

    it "handles a query ending with %" do
      query = "all heroes 500%"
      input_search_query(query)
      submit_search_form
      validate_search_query(query)
    end
  end

  # TODO: Test clicking on filters
end

def input_search_query(query)
  find("header").fill_in "Search", with: query
end

def submit_search_form
  find("header").find("input.search__submit").click
end

def validate_search_query(query)
  expect(page).to have_text("Workshop Codes for #{query}")
  within("header") do
    expect(page).to have_field("query", with: query)
  end
  expect(page).not_to have_text("Something went wrong on our end")
end
