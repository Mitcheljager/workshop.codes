require 'rails_helper'

# Courtesy of https://github.com/omniauth/omniauth/pull/809#issuecomment-512689882
# Make sure that https://nvd.nist.gov/vuln/detail/CVE-2015-9284 is mitigated
RSpec.describe "CVE-2015-9284", type: :request do
  describe "GET /auth/:provider" do
    it "rejects a call to authenticate with Discord" do
      expect {
        get '/auth/discord'
      }.to raise_error(ActionController::RoutingError)
    end

    it "rejects a call to authenticate with Battle.net" do
      expect {
        get '/auth/bnet'
      }.to raise_error(ActionController::RoutingError)
    end
  end

  describe "POST /auth/:provider without CSRF token" do
    before do
      @allow_forgery_protection = ActionController::Base.allow_forgery_protection
      ActionController::Base.allow_forgery_protection = true
    end

    it "blocks a call to authenticate with Discord" do
      expect {
        post '/auth/discord'
      }.to raise_error(ActionController::InvalidAuthenticityToken)
    end

    it "blocks a call to authenticate with Battle.net" do
      expect {
        post '/auth/bnet'
      }.to raise_error(ActionController::InvalidAuthenticityToken)
    end

    after do
      ActionController::Base.allow_forgery_protection = @allow_forgery_protection
    end
  end
end
