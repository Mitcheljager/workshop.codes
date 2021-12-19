require "rails_helper"

RSpec.describe Post, type: :model do
  context "associations" do
    it { should belong_to(:user) }

    it { should have_many(:favorites).dependent(:destroy) }
    it { should have_many(:revisions).dependent(:destroy) }
    it { should have_many(:comments).dependent(:destroy) }
    it { should have_many(:email_notifications).dependent(:destroy) }
  end

  context "validations" do
    it { should validate_presence_of(:user_id) }

    it { should validate_presence_of(:locale) }
    it { should allow_values("en", "ko").for(:locale) }

    it { should validate_presence_of(:title) }
    it { should validate_length_of(:title).is_at_most(75) }
    it { should validate_length_of(:title).is_at_least(5) }

    it { should validate_presence_of(:code) }
    it { should validate_length_of(:code).is_at_most(6) }
    it { should validate_length_of(:code).is_at_least(5) }

    it { should validate_length_of(:description).is_at_most(100000) }

    it { should validate_presence_of(:categories) }
    it { should validate_presence_of(:heroes) }
    it { should validate_presence_of(:maps) }
  end

  describe "validation of supported players" do
    before(:each) do
      @post = create(:post)
      expect(@post).to be_valid
    end

    context "for valid ranges" do
      it "allows a range" do
        @post.min_players = 2
        @post.max_players = 10
        expect(@post).to be_valid
      end

      it "allows the endpoints" do
        @post.min_players = 1
        @post.max_players = 12
        expect(@post).to be_valid
      end

      it "allows a single value" do
        @post.min_players = 1
        @post.max_players = 1
        expect(@post).to be_valid
      end
    end

    context "does not allow nil values" do
      it "for min_players" do
        @post.min_players = nil
        expect(@post).not_to be_valid
      end

      it "for max_players" do
        @post.max_players = nil
        expect(@post).not_to be_valid
      end

      it "for both values" do
        @post.min_players = nil
        @post.max_players = nil
        expect(@post).not_to be_valid
      end
    end

    context "does not allow invalid ranges" do
      it "due to min_players" do
        @post.min_players = 0
        expect(@post).not_to be_valid

        @post.min_players = 13
        expect(@post).not_to be_valid
      end

      it "due to max_players" do
        @post.max_players = 0
        expect(@post).not_to be_valid

        @post.max_players = 13
        expect(@post).not_to be_valid
      end

      it "due to min_players > max_players" do
        @post.min_players = 10
        @post.max_players = 5
        expect(@post).not_to be_valid
      end
    end
  end
end
