require "rails_helper"

RSpec.describe "Posts controller", type: :request do
  let!(:user) { create(:user) }
  let!(:posts) { create_list(:post, PAGE_SIZE, user_id: user.id) }
  let(:post) { posts.first }

  before do
    allow(YAML).to receive(:safe_load).with(File.read(Rails.root.join("config/arrays", "maps.yml"))).and_return([
      { "name" => "Hanamura", "type" => "Assault", "slug" => "hanamura" },
      { "name" => "Paris", "type" => "Assault", "slug" => "paris" }
    ])

    allow(YAML).to receive(:safe_load).with(File.read(Rails.root.join("config/arrays", "heroes.yml"))).and_return([
      { "name" => "Doomfist", "category" => "Tank" },
      { "name" => "Sigma", "category" => "Tank" }
    ])

    allow(YAML).to receive(:safe_load).with(File.read(Rails.root.join("config/arrays", "categories.yml"))).and_return([
      "Solo",
      "Parkour"
    ])
  end

  describe "GET root" do
    before { get "/" }

    it "returns posts" do
      expect(posts).not_to be_empty
      expect(posts.size).to eq(PAGE_SIZE)
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
