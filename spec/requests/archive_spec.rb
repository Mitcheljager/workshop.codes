require 'rails_helper'
require './spec/support/oauth_helpers'

RSpec.configure do |c|
  c.include Helpers::OAuth
end

RSpec.describe "Archived posts controller", type: :request do
  let!(:archive_owner) { create(:user, username: "elo-hell-archive") }
  let!(:archive_post) { create(:post, user: archive_owner) }

  before do
    OmniAuth.config.test_mode = true
    Faker::UniqueGenerator.clear # Clear unique value tracker

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

  after do
    OmniAuth.config.test_mode = false
  end

  before(:each) do
    @username = "#{Faker::Name.unique.first_name}##{Faker::Number.number(digits: 5)}"
    auth = ArchiveAuthorization.create(code: archive_post.code, bnet_id: oauth_username_to_mock_uid("bnet", @username))
    auth.save!(validate: false) # Because technically the bnet_id is not valid
  end

  describe "valid" do
    context "transfer request" do
      it "works for authorized, direct logins" do
        expect {
          stub_oauth_flow("bnet", @username) do
            post "/auth/bnet"
            follow_redirect!
          end
        }.to change { User.count }.by(1)

        expect {
          patch archive_path(code: archive_post.code)
          archive_post.reload # Needed to refresh in-memory record
        }.to change { archive_post.user }

        expect(response).to redirect_to(post_path(code: archive_post.code))
        expect(flash[:notice]).to eq("Post successfully transferred")
        expect(archive_post.user).to eq(User.find_by(username: @username))
      end

      it "works for authorized, indirect logins" do
        user = create(:user, password: "password")
        post "/sessions", params: { username: user.username, password: "password" }
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).not_to be_present

        # Link Battle.net user
        expect {
          stub_oauth_flow("bnet", @username) do
            post "/auth/bnet"
            follow_redirect! # /auth/bnet/callback
          end
        }.to change { User.count }.by(1)
        expect(response).to redirect_to(linked_users_path)
        expect(flash[:alert]).to eq("Your Battle.net account '#{@username}' has been linked.")

        expect {
          patch archive_path(code: archive_post.code)
          archive_post.reload # Needed to refresh in-memory record
        }.to change { archive_post.user }

        expect(response).to redirect_to(post_path(code: archive_post.code))
        expect(flash[:notice]).to eq("Post successfully transferred")
        expect(archive_post.user).to eq(User.find_by(username: user.username))
      end
    end

    context "delete request" do
      it "works for valid temporary authorization" do
        stub_oauth_flow("bnet", @username) do
          post "/auth/bnet?auth_only_no_user=1"
          follow_redirect! # To get to /auth/callback
          follow_redirect! # To get to callback redirect
        end
        expect(session[:oauth_uid]).to be_present

        expect(response).to have_http_status(:ok)
        expect(request.path).to eq(root_path)

        expect {
          delete archive_path(code: archive_post.code)
        }.to change { Post.count }.by(-1)
      end

      it "works for an authorized OAuth account" do
        expect {
          stub_oauth_flow("bnet", @username) do
            post "/auth/bnet"
            follow_redirect!
            follow_redirect!
          end
        }.to change { User.count }.by(1)

        expect(response).to have_http_status(:ok)
        expect(request.path).to eq(root_path)

        expect {
          delete archive_path(code: archive_post.code)
        }.to change { Post.count }.by(-1)
      end

      it "works for an account with the correct OAuth account linked" do
        user = create(:user, password: "password")
        post "/sessions", params: { username: user.username, password: "password" }
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).not_to be_present

        expect {
          stub_oauth_flow("bnet", @username) do
            post "/auth/bnet"
            follow_redirect!
          end
          user.reload
        }.to change { user.linked_users.count }.by(1)
        expect(flash[:alert]).to eq("Your Battle.net account '#{@username}' has been linked.")

        expect {
          delete archive_path(code: archive_post.code)
        }.to change { Post.count }.by(-1)
      end
    end
  end

  describe "invalid" do
    context "transfer request" do
      it "does not work for temporary authorizations unbacked by a user" do
        stub_oauth_flow("bnet", @username) do
          post "/auth/bnet?auth_only_no_user=1"
          follow_redirect! # To get to /auth/callback
          follow_redirect! # To get to callback's redirect
        end

        expect {
          patch archive_path(code: archive_post.code)
          archive_post.reload
        }.not_to change { archive_post.user }

        expect(response).to redirect_to(login_path)
        expect(flash[:error]).to eq("You need to be logged into an existing Workshop.codes account in order to transfer ownership")
      end

      it "does not work for a user who is not logged in" do
        expect {
          patch archive_path(code: archive_post.code)
          archive_post.reload
        }.not_to change { archive_post.user }

        expect(response).to redirect_to(post_path(code: archive_post.code))
        expect(flash[:error]).to eq("You are not authorized to perform that action")
      end

      it "does not work for a user with an incorrect linked BNet account" do
        true_username = "#{Faker::Name.unique.first_name}##{Faker::Number.number(digits: 5)}"
        auth = ArchiveAuthorization.find_by(code: archive_post.code)
        auth.bnet_id = oauth_username_to_mock_uid("bnet", true_username)
        auth.save!(validate: false) # Because technically the bnet_id is not valid

        username = Faker::Name.unique.first_name
        user = create(:user, username: username, password: "password")
        bnet_username = "#{username}##{Faker::Number.number(digits: 5)}"

        # Login and link
        post "/sessions", params: { username: username, password: "password" }
        expect(flash[:alert]).not_to be_present
        stub_oauth_flow("bnet", bnet_username) do
          post "/auth/bnet"
          follow_redirect!
        end
        expect(flash[:alert]).to eq("Your Battle.net account '#{bnet_username}' has been linked.")

        expect {
          patch archive_path(code: archive_post.code)
          archive_post.reload
        }.not_to change { archive_post.user }
        expect(flash[:error]).to eq("You are not authorized to perform that action")
      end

      it "does not work for the wrong OAuth user" do
        wrong_username = Faker::Name.unique.first_name
        wrong_battletag = "#{wrong_username}##{Faker::Number.number(digits: 5)}"

        # Login as OAuth user
        expect {
          stub_oauth_flow("bnet", wrong_battletag) do
            post "/auth/bnet"
            follow_redirect!
          end
        }.to change { User.count }.by(1)

        expect {
          patch archive_path(code: archive_post.code)
          archive_post.reload
        }.not_to change { archive_post.user }
        expect(flash[:error]).to eq("You are not authorized to perform that action")
      end

      it "does not work for a post without an authorization" do
        ArchiveAuthorization.find_by(code: archive_post.code).destroy!

        expect {
          stub_oauth_flow("bnet", @username) do
            post "/auth/bnet"
            follow_redirect!
          end
        }.to change { User.count }.by(1)

        expect {
          patch archive_path(code: archive_post.code)
          archive_post.reload # Needed to refresh in-memory record
        }.not_to change { archive_post.user }

        expect(response).to redirect_to(post_path(code: archive_post.code))
        expect(flash[:error]).to eq("You are not authorized to perform that action")
      end
    end

    context "delete/destroy request" do
      it "does not work for a user who is not logged in" do
        expect {
          delete archive_path(code: archive_post.code)
        }.not_to change { Post.count }
      end

      it "does not work for a user without the right BNet account" do
        wrong_wsc_username = Faker::Name.first_name
        user = create(:user, username: wrong_wsc_username, password: "password")
        post "/sessions", params: { username: wrong_wsc_username, password: "password" }
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).not_to be_present

        wrong_bnet_username = Faker::Name.unique.first_name
        wrong_battletag = "#{wrong_bnet_username}##{Faker::Number.number(digits: 5)}"

        # Link BNet user
        expect {
          stub_oauth_flow("bnet", wrong_battletag) do
            post "/auth/bnet"
            follow_redirect!
          end
        }.to change { user.linked_users.count }.by(1)

        expect {
          delete archive_path(code: archive_post.code)
        }.not_to change { Post.count }
      end

      it "does not work for an incorrect OAuth user" do
        wrong_username = Faker::Name.unique.first_name
        wrong_battletag = "#{wrong_username}##{Faker::Number.number(digits: 5)}"

        # Login as OAuth user
        expect {
          stub_oauth_flow("bnet", wrong_battletag) do
            post "/auth/bnet"
            follow_redirect!
          end
        }.to change { User.count }.by(1)

        expect {
          delete archive_path(code: archive_post.code)
        }.not_to change { Post.count }
        expect(flash[:error]).to eq("You are not authorized to perform that action")
      end

      it "does not work for an incorrect temporary OAuth authentication" do
        wrong_username = Faker::Name.unique.first_name
        wrong_battletag = "#{wrong_username}##{Faker::Number.number(digits: 5)}"

        expect {
          stub_oauth_flow("bnet", wrong_battletag) do
            post "/auth/bnet?auth_only_no_user=1"
            follow_redirect!
          end
        }.not_to change { User.count }
        expect(session[:oauth_uid]).to be_present

        expect {
          delete archive_path(code: archive_post.code)
        }.not_to change { Post.count }
        expect(flash[:error]).to eq("You are not authorized to perform that action")
      end

      it "does not work on a post without an authorization" do
        ArchiveAuthorization.find_by(code: archive_post.code).destroy!

        expect {
          stub_oauth_flow("bnet", @username) do
            post "/auth/bnet"
            follow_redirect!
          end
        }.to change { User.count }.by(1)

        expect {
          delete archive_path(code: archive_post.code)
        }.not_to change { Post.count }
        expect(flash[:error]).to eq("You are not authorized to perform that action")
      end
    end

    context "show request" do
      it "does not work for a code that does not exist" do
        post_code = archive_post.code
        archive_post.destroy!

        get archive_path(code: post_code)
        expect(response).to redirect_to(posts_path)
        expect(flash[:error]).to eq("Post not found")
      end
    end
  end
end
