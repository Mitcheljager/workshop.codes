require "rails_helper"

RSpec.describe "Profiles", type: :request do
  let!(:user) { create(:user) }
  let!(:posts) { create_list(:post, 30, user_id: user.id) }

  before :each do
    create(:block, user: user, name: "highlight", properties: "{post: #{posts.first.id}}")
  end

  describe "GET /u/:username" do
    it "returns status code 200 for existing username" do
      get "/u/#{ user.username }"
      expect(response).to have_http_status(:ok)
    end

    it "returns status code 404 for nonexisting username" do
      get "/u/user_does_not_exist"
      expect(response).to have_http_status(:not_found)
    end
  end
end
