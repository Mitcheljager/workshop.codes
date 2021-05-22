require 'rails_helper'

RSpec.describe Derivative, type: :model do
  describe "associations and validations" do
    it { should belong_to(:source) }
    it { should belong_to(:derivation) }

    it { should validate_presence_of(:source_id) }
    it { should validate_presence_of(:derivation_id) }
    
    context "validation of derivation" do
      it "doesn't allow a post to derive from itself" do
        attrs = attributes_for(:derivative)
        attrs[:derivation] = attrs[:source]
        derivation = Derivative.new attrs
        expect(derivation).not_to be_valid
      end

      it "allows a post to derive from another post" do
        expect(build(:derivative)).to be_valid
      end
    end
  end
end
