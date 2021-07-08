require 'rails_helper'

RSpec.describe Derivative, type: :model do
  describe "associations and validations" do
    it { should belong_to(:source).optional }
    it { should belong_to(:derivation) }

    it { should validate_presence_of(:source_code) }
    it { should validate_presence_of(:derivation_id) }
    
    context "validation of derivation" do
      it "doesn't allow a post to derive from itself" do
        attrs = attributes_for(:derivative)
        attrs[:derivation] = attrs[:source]
        derivation = Derivative.new attrs
        expect(derivation).not_to be_valid
      end

      it "doesn't allow a post to derive from its own import code" do
        deriv = build(:derivative)
        deriv.source_code = deriv.derivation.code
        expect(deriv).not_to be_valid
      end

      it "allows a post to derive from another post" do
        expect(build(:derivative)).to be_valid
      end

      it "doesn't allow multiple derivations to exist for any given pair of posts" do
        deriv1 = create(:derivative)
        expect(deriv1).to be_valid

        deriv2 = build(:derivative)
        deriv2.source = deriv1.source
        deriv2.derivation = deriv1.derivation
        expect(deriv2).not_to be_valid
      end

      it "doesn't allow multiple derivations to exist for any given post and source import code" do
        deriv1 = create(:derivative)
        deriv1.source = nil
        deriv1.source_code = "CODE1"
        deriv1.save!
        expect(deriv1).to be_valid

        deriv2 = build(:derivative)
        deriv2.source = nil
        deriv2.derivation = deriv1.derivation
        deriv2.source_code = deriv1.source_code
        expect(deriv2).not_to be_valid
      end

      it "allows multiple derivations from a non-existent post" do
        post1 = create(:post)
        post2 = create(:post)

        deriv1 = build(:derivative)
        deriv1.source = nil
        deriv1.source_code = "ABCDE"
        deriv1.derivation = post1
        expect(deriv1).to be_valid
        deriv1.save!

        deriv2 = build(:derivative)
        deriv2.source = nil
        deriv2.source_code = "ABCDE"
        deriv2.derivation = post2
        expect(deriv2).to be_valid
        deriv2.save!
      end

      it "allows multiple derivations from a valid post" do
        post1 = create(:post)
        post2 = create(:post)
        post3 = create(:post)

        deriv1 = build(:derivative)
        deriv1.source = post1
        deriv1.source_code = post1.code
        deriv1.derivation = post2
        expect(deriv1).to be_valid
        deriv1.save!

        deriv2 = build(:derivative)
        deriv2.source = post1
        deriv2.source_code = post1.code
        deriv2.derivation = post3
        expect(deriv2).to be_valid
        deriv2.save!
      end
    end
  end
end
