require "rails_helper"

RSpec.describe "Posts controller", type: :request do
  let!(:user) { create(:user) }
  let!(:posts) { create_list(:post, 20, user_id: user.id) }
  let(:post) { posts.first }

  describe "GET root" do
    before { get "/" }

    it "returns posts" do
      expect(posts).not_to be_empty
      expect(posts.size).to eq(20)
    end

    it "returns status code 200" do
      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /:code" do
    before { get "/#{ post.code }" }

    context "when the record exists" do
      it "returns status code 200" do
        expect(response).to have_http_status(:ok)
      end

      it "reponse has post content" do
        expect(response.body).to include(post.title)
        expect(response.body).to include(post.code)
        expect(response.body).to include(post.user.username)
      end
    end
  end
end
