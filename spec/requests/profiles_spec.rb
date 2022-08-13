require "rails_helper"

RSpec.describe "Profiles", type: :request do
  let!(:user) { create(:user) }
  let!(:ko_user) { create(:user, username: "민서") }
  let!(:posts) { create_list(:post, 30, user_id: user.id) }

  before :each do
    create(:block, user: user, name: "highlight", properties: "{post: #{posts.first.id}}")
  end

  describe "GET /u/:username" do
    it "returns status code 200 for existing username" do
      get profile_path(username: user.username)
      expect(response).to have_http_status(:ok)
    end

    it "returns status code 200 for a user with a non-ASCII username" do
      get profile_path(username: ko_user.username)
      expect(response).to have_http_status(:ok)
    end

    it "returns status code 404 for nonexisting username" do
      get profile_path(username: "does_not_exist")
      expect(response).to have_http_status(:not_found)
    end
  end
end
