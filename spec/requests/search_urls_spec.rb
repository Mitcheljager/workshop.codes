require 'rails_helper'

RSpec.describe "SearchUrls", type: :request do
  describe "GET old search URLs" do
    it "redirects a simple old URL" do
      get "/heroes/reinhardt"
      expect(response).to have_http_status(:moved_permanently)
    end

    it "redirects a more complex old URL" do
      get "/categories/1vs1/maps/hanamura"
      expect(response).to have_http_status(:moved_permanently)
    end

    it "gives JSON when requested" do
      get "/heroes/reinhardt.json"
      expect(response.content_type).to start_with("application/json")
    end

    it "redirects GET /search with no parameters to home" do
      get "/search"
      expect(response).to have_http_status(:found)
    end
  end

  describe "POST to old search URLs" do
    it "redirects an old search with one filter" do
      post "/maps/havana/search", params: { "query": "zombie" }
      expect(response).to have_http_status(:moved_permanently)
    end

    it "redirects an old search with many filters" do
      post "/heroes/lucio/maps/paris/search", params: { "query": "see you move" }
      expect(response).to have_http_status(:moved_permanently)
    end
  end

  describe "POST to new search URL" do
    it "redirects a search with no filters" do
      post "/search", params: { "query": "banana" }
      expect(response).to have_http_status(:found)
    end

    it "redirects a search with filters" do
      post "/search", params: { "query": "banana", "heroes": "dva", "map": "hanamura" }
      expect(response).to have_http_status(:found)
    end
  end
end
