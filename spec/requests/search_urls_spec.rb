require 'rails_helper'

RSpec.describe "SearchUrls", type: :request do
  describe "GET old search URLs" do
    it "redirects a simple old URL" do
      get "/heroes/reinhardt"
      expect(response).to have_http_status(:moved_permanently)
      expect(response).to redirect_to(filter_path(params: { hero: "reinhardt" }))
    end

    it "redirects a more complex old URL" do
      get "/categories/1vs1/maps/hanamura"
      expect(response).to have_http_status(:moved_permanently)
      expect(response).to redirect_to(filter_path(params: {
        category: "1vs1",
        map: "hanamura"
      }))
    end

    it "gives JSON when requested" do
      get "/heroes/reinhardt.json"
      expect(response.content_type).to start_with("application/json")
      expect(response).to have_http_status(:moved_permanently)
      expect(response).to redirect_to(filter_path(params: { hero: "reinhardt" }))
    end

    it "redirects GET /search with no parameters to home" do
      get "/search"
      expect(response).to have_http_status(:found)
      expect(response).to redirect_to(root_path)
    end
  end

  describe "GET new search URLs" do
    it "handles a query alone" do
      search_params = {
        search: "charles the 9th"
      }
      get filter_path(params: search_params)

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("charles the 9th")
    end

    context "with filters and no query" do
      it "handles a single filter" do
        search_params = {
          map: "dorado"
        }
        get filter_path(params: search_params)

        expect(response).to have_http_status(:ok)
      expect(response.body).to include("Dorado")
      end

      it "handles multiple filters" do
        search_params = {
          map: "hanamura",
          category: "scrims",
          hero: "wrecking-ball"
        }
        get filter_path(params: search_params)

        expect(response).to have_http_status(:ok)
        expect(response.body).to include("Hanamura")
        expect(response.body).to include("scrims")
        expect(response.body).to include("Wrecking Ball")
      end
    end

    context "with filters and a query" do
      it "handles a single filter and a query" do
        search_params = {
          expired: true,
          search: "charles the 9th"
        }
        get filter_path(params: search_params)

        expect(response).to have_http_status(:ok)
        expect(response.body).to include("expired")
        expect(response.body).to include("charles the 9th")
      end

      it "handles multiple filters and a query" do
        search_params = {
          map: "temple-of-anubis",
          category: "tools",
          hero: "wrecking-ball",
          sort: "views",
          search: "charles the 9th"
        }
        get filter_path(params: search_params)

        expect(response).to have_http_status(:ok)
        expect(response.body).to include("Temple Of Anubis")
        expect(response.body).to include("tools")
        expect(response.body).to include("Wrecking Ball")
        expect(response.body).to include("views")
        expect(response.body).to include("charles the 9th")
      end
    end
  end

  describe "POST to old search URLs" do
    context "using path-based parameters" do
      it "redirects an old search with one filter" do
        search_params = {
          query: "zombie"
        }
        post "/maps/havana/search", params: search_params
        # :query is renamed to :search
        search_params[:search] = search_params.delete(:query)

        search_params = search_params.merge({
          map: "havana"
        })
        expect(response).to have_http_status(:moved_permanently)
        expect(response).to redirect_to(filter_path(params: search_params))
      end

      it "redirects an old search with many filters" do
        search_params = {
          query: "see you move"
        }
        post "/heroes/lucio/maps/paris/search", params: search_params
        # :query is renamed to :search
        search_params[:search] = search_params.delete(:query)

        search_params = search_params.merge({
          hero: "lucio",
          map: "paris"
        })
        expect(response).to have_http_status(:moved_permanently)
        expect(response).to redirect_to(filter_path(params: search_params))
      end
    end

    it "redirects an old search with many filters" do
      post "/heroes/lucio/maps/paris/search", params: { "query": "see you move" }
      expect(response).to have_http_status(:moved_permanently)
    end
  end

  describe "POST to new search URL" do
    it "redirects a search with no filters" do
      search_params = { query: "banana" }
      post "/search", params: search_params
      # :query is renamed to :search
      search_params[:search] = search_params.delete(:query)

      expect(response).to have_http_status(:found)
      expect(response).to redirect_to(filter_path(params: search_params))
    end

    it "redirects a search with filters" do
      search_params = {
        query: "banana",
        hero: "dva",
        map: "hanamura"
      }
      post "/search", params: search_params
      # :query is renamed to :search
      search_params[:search] = search_params.delete(:query)

      expect(response).to have_http_status(:found)
      expect(response).to redirect_to(filter_path(params: search_params))
    end
  end
end
