ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'
require 'capybara/rails'
require 'capybara/minitest'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Add more helper methods to be used by all tests here...
end

module SignInHelper
  def sign_in_as(user)
    visit logout_path
    visit login_path

    assert page.has_content? "Login"

    fill_in "username", with: user.username
    fill_in "password", with: "password"
    click_button "Submit"

    assert page.has_content? "Hello there,"
  end
end

class ActionDispatch::IntegrationTest
  include SignInHelper
end

class ActionDispatch::Routing::RouteSet
  def default_url_options(options = {})
    { locale: I18n.locale }.merge options
  end
end
