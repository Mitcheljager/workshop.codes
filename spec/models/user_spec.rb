require "rails_helper"

RSpec.describe User, type: :model do
  context "associations" do
    it { should have_many(:favorites).dependent(:destroy) }
    it { have_many(:posts).dependent(:destroy) }
    it { have_many(:remember_tokens).dependent(:destroy) }
    it { have_many(:favorites).dependent(:destroy) }
    it { have_many(:comments).dependent(:destroy) }
    it { have_many(:notifications).dependent(:destroy) }
    it { have_many(:activities).dependent(:destroy) }
    it { have_many(:forgot_password_tokens).dependent(:destroy) }
    it { have_many(:collections).dependent(:destroy) }
    it { have_many(:reports).dependent(:destroy) }
    it { have_many(:wiki_edits).dependent(:destroy) }
  end

  context "validations" do
    it { should validate_presence_of(:username) }

    it { should validate_presence_of(:password) }
    it { should validate_length_of(:password).is_at_least(8) }

    it { should validate_length_of(:description).is_at_most(255) }
  end
end
