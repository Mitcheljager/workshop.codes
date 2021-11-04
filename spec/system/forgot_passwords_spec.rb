require 'rails_helper'
require './spec/support/user_helpers'
require 'capybara/rails'

RSpec.configure do |c|
  c.include Helpers::Users
end

RSpec.describe "ForgotPasswords", type: :system do
  include Capybara::DSL

  before do
    driven_by(:rack_test)
  end

  before(:each) do
    ActionMailer::Base.deliveries.clear
  end

  describe "happy path: proper reset procedure" do
    before(:each) do
      @user = create(:user, password: "password", email: "loxton@overwatch.net")
      sign_in_as @user
    end

    context "allows reset of password" do
      it "for default user" do
        attempt_reset_password
      end

      it "for verified, nice_url user" do
        @user.verified = true
        @user.nice_url = @user.username.split('#')[0]

        attempt_reset_password
      end
    end
  end
end

def attempt_reset_password
  visit logout_path
  # Request password reset
  visit new_forgot_password_path
  fill_in "forgot_password_email", with: @user.email
  click_on "Submit"

  # Pick up reset URL from email
  email = ActionMailer::Base.deliveries.last
  expect(email).to be_present
  body = email.body.to_s
  expect(body).to include("requested a password reset")
  /(?<url>https?:\/\/[^\/]*?\/forgot-password\/.*)"/ =~ body
  expect(url).to be_present

  # Use reset token to reset password
  visit url
  expect(page).to have_content "Reset your password"
  fill_in "forgot_password_password", with: "new_password"
  fill_in "forgot_password_password_confirmation", with: "new_password"
  click_on "Submit"

  expect(page).to have_content "Password successfully reset"
  expect(page).to have_current_path login_path

  # Check the old password does not work
  fill_in "username", with: @user.username
  fill_in "password", with: "password"
  click_on "Submit"
  expect(page).to have_content "Username or password is invalid"

  # Use the new password
  sign_in_as(@user, "new_password")
end
