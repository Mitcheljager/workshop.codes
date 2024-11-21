require "rails_helper"

RSpec.describe "On Fire controller", type: :request do
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

  describe "GET On Fire Index" do
    before { get "/on-fire" }

    it "returns posts" do
      expect(posts).not_to be_empty
      expect(posts.size).to eq(PAGE_SIZE)
    end

    it "returns status code 200" do
      expect(response).to have_http_status(:ok)
    end
  end
end
