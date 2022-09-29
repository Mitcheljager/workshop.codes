require 'rails_helper'

RSpec.describe "Articles", type: :request do

  describe "GET /show" do
    it "returns http success" do
      get "/articles/show"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /edit" do
    it "returns http success" do
      get "/articles/edit"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create" do
    it "returns http success" do
      get "/articles/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /update" do
    it "returns http success" do
      get "/articles/update"
      expect(response).to have_http_status(:success)
    end
  end

end
