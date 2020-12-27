require "rails_helper"

RSpec.describe Post, type: :model do  
  context "associations" do
    it { should belong_to(:user) }

    it { should have_many(:favorites).dependent(:destroy) }
    it { should have_many(:revisions).dependent(:destroy) }
    it { should have_many(:comments).dependent(:destroy) }
    it { should have_many(:while_you_waits).dependent(:destroy) }
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

    it { should validate_presence_of(:categories) }
    it { should validate_presence_of(:heroes) }
    it { should validate_presence_of(:maps) }
  end
end
