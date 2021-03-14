require "rails_helper"

RSpec.describe "On Fire controller", type: :request do
  let!(:user) { create(:user) }
  let!(:posts) { create_list(:post, 20, user_id: user.id) }
  let(:post) { posts.first }

  describe "GET On Fire Index" do
    before { get "/on-fire" }

    it "returns posts" do
      expect(posts).not_to be_empty
      expect(posts.size).to eq(20)
    end

    it "returns status code 200" do
      expect(response).to have_http_status(:ok)
    end
  end
end
