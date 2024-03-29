require 'rails_helper'
require './spec/support/oauth_helpers'

RSpec.configure do |c|
  c.include Helpers::OAuth
end

RSpec.describe "Temporary OAuth requests", type: :request do
  before do
    OmniAuth.config.test_mode = true
  end

  after do
    OmniAuth.config.test_mode = false
  end

  describe "initial temporary authorization" do
    it "works for Battle.net" do
      battletag = "#{Faker::Name.first_name}##{Faker::Number.number(digits: 5)}"

      stub_oauth_flow("bnet", battletag) do
        Timecop.freeze do
          post "/auth/bnet?auth_only_no_user=1"
          follow_redirect! # To /auth/bnet/callback

          expect(session[:oauth_provider]).to eq("bnet")
          expect(session[:oauth_uid]).to eq(oauth_username_to_mock_uid("bnet", battletag))
          expect(session[:oauth_expires_at]).to eq(Time.now + 30.minutes)
          expect(flash[:notice]).to include(battletag)
        end
      end
    end

    it "works for Discord" do
      username = Faker::Name.first_name
      full_username = "#{username}##{Faker::Number.number(digits: 4)}"

      stub_oauth_flow("discord", full_username) do
        Timecop.freeze do
          post "/auth/discord?auth_only_no_user=1"
          follow_redirect! # To /auth/discord/callback

          expect(session[:oauth_provider]).to eq("discord")
          expect(session[:oauth_uid]).to eq(oauth_username_to_mock_uid("discord", full_username))
          expect(session[:oauth_expires_at]).to eq(Time.now + 30.minutes)
          expect(flash[:notice]).to include(username)
        end
      end
    end
  end

  describe "within expiration period" do
    it "does not expire on the next request" do
      obtain_temporary_oauth_session

      get root_path
      expect(session[:oauth_provider]).to be_present
      expect(session[:oauth_uid]).to be_present
      expect(flash[:warning]).not_to be_present
    end

    it "does not expire within a minute" do
      Timecop.freeze do
        obtain_temporary_oauth_session

        Timecop.travel(Time.now + 1.minute) do
          get root_path
          expect(session[:oauth_provider]).to be_present
          expect(session[:oauth_uid]).to be_present
          expect(flash[:warning]).not_to be_present
        end
      end
    end
  end

  describe "after expiration period" do
    it "expires the session on the next request" do
      obtain_temporary_oauth_session

      Timecop.travel(Time.now + 30.minutes) do
        get root_path
        expect(session[:oauth_provider]).not_to be_present
        expect(session[:oauth_uid]).not_to be_present
        expect(flash[:warning]).to eq("Temporary session expired.")
      end
    end

    it "resists a session cookie copy attack" do
      obtain_temporary_oauth_session

      # Need to do one more redirect to emulate actual user experience,
      # since `obtain_temporary_oauth_session` only goes to callback and
      # doesn't follow the redirect to the provided path from there.
      #
      # This is fine in other tests because we don't care about the exact
      # state of the cookies/session until after we make another request,
      # but here we need the state of the cookies/session exactly as they
      # would be in a client's browser.
      follow_redirect!

      session_cookie_key = Rails.application.config.session_options[:key]
      # Simulate copying the cookie down.
      session_cookie = cookies[session_cookie_key]

      Timecop.travel(Time.now + 30.minutes) do
        # We now simulate copying the session cookie back
        cookies[session_cookie_key] = session_cookie
        get root_path

        expect(session[:oauth_provider]).not_to be_present
        expect(session[:oauth_uid]).not_to be_present
        expect(flash[:warning]).to eq("Temporary session expired.")
      end
    end
  end
end

def obtain_temporary_oauth_session
  username = Faker::Name.first_name
  full_username = "#{username}##{Faker::Number.number(digits: 4)}"
  provider = ["bnet", "discord"].sample

  stub_oauth_flow(provider, full_username) do
    post "/auth/#{provider}?auth_only_no_user=1"
    follow_redirect! # To /auth/:provider/callback

    expect(session[:oauth_provider]).to eq(provider)
  end
end
