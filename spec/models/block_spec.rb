require 'rails_helper'

RSpec.describe Block, type: :model do
  context "associations" do
    it { should belong_to(:user) }
  end

  context "validations" do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:content_type) }
    it { should validate_presence_of(:user_id) }
  end
end
