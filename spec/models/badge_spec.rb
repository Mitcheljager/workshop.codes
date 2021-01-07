require 'rails_helper'

RSpec.describe Badge, type: :model do
  context "associations" do
    it { should belong_to(:user) }
  end
end
