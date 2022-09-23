require 'test_helper'
require 'capybara/rails'
require 'capybara/minitest'

class PostsControllerTest < ActionDispatch::IntegrationTest
  include Capybara::DSL
end
