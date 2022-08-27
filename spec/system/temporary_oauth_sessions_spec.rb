require 'rails_helper'

RSpec.describe "TemporaryOAuthSessions", type: :system do
  include Capybara::DSL

  before do
    driven_by(:selenium_chrome_headless)
    OmniAuth.config.test_mode = true
  end

  after do
    OmniAuth.config.test_mode = false
  end

  before(:each) do
    OmniAuth.config.mock_auth[:bnet] = nil
    OmniAuth.config.mock_auth[:discord] = nil
  end

  describe "initial temporary authorization" do
    it "works for Battle.net" do
      username = "#{Faker::Name.first_name}##{Faker::Number.number(digits: 4)}"
      OmniAuth.config.mock_auth[:bnet] = OmniAuth::AuthHash.new({
        uid: "#{Faker::Number.number(digits: 10)}",
        provider: "bnet",
        info: {
          battletag: username,
          image: "https://ehe.gg/media/img/logos/Elo-Hell-Logo_I-C-Dark.png"
        }
      })

      visit login_path
      # ! HACK: Find a page where this actually gets used
      page.execute_script("document.querySelector('.button--bnet').href = '/auth/bnet?auth_only_no_user=1'")
      click_on "Login with Battle.net"

      expect(page).to have_content username
    end

    it "works for Discord" do
      username = Faker::Name.first_name
      OmniAuth.config.mock_auth[:discord] = OmniAuth::AuthHash.new({
        uid: "#{Faker::Number.number(digits: 10)}",
        provider: "discord",
        info: {
          name: username,
          image: "https://ehe.gg/media/img/logos/Elo-Hell-Logo_I-C-Dark.png"
        },
        extra: {
          raw_info: {
            discriminator: Faker::Number.number(digits: 4)
          }
        }
      })

      visit login_path
      # ! HACK: Find a page where this actually gets used
      page.execute_script("document.querySelector('.button--discord').href = '/auth/discord?auth_only_no_user=1'")
      click_on "Login with Discord"

      expect(page).to have_content username
    end
  end

  describe "within expiration period" do
    it "does not expire on next request" do
      obtain_temporary_oauth_session

      visit root_path
      expect(page).not_to have_content "Temporary session expired."
    end

    it "does not expire within a minute" do
      obtain_temporary_oauth_session

      Timecop.freeze(Time.now + 1.minute) do
        visit root_path
        expect(page).not_to have_content "Temporary session expired."
      end
    end
  end

  describe "after expiration period" do
    it "expires the session" do
      obtain_temporary_oauth_session

      Timecop.travel(Time.now + 30.minutes) do
        visit root_path
        expect(page).to have_content "Temporary session expired."
      end
    end
  end
end

def obtain_temporary_oauth_session
  username = "#{Faker::Name.first_name}##{Faker::Number.number(digits: 4)}"
  OmniAuth.config.mock_auth[:bnet] = OmniAuth::AuthHash.new({
    uid: "#{Faker::Number.number(digits: 10)}",
    provider: "bnet",
    info: {
      battletag: username,
      image: "https://ehe.gg/media/img/logos/Elo-Hell-Logo_I-C-Dark.png"
    }
  })

  visit login_path
  # ! HACK: Find a page where this actually gets used
  page.execute_script("document.querySelector('.button--bnet').href = '/auth/bnet?auth_only_no_user=1'")
  click_on "Login with Battle.net"

  expect(page).to have_content username
end
