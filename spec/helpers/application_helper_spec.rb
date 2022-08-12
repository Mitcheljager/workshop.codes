require 'rails_helper'

# Specs in this file have access to a helper object that includes
# the ApplicationHelper. For example:
#
# describe ApplicationHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
RSpec.describe ApplicationHelper, type: :helper do
  describe "i18n_value_in_array" do

    before(:each) do
      I18n.locale = "en"
    end

    after(:each) do
      I18n.locale = I18n.default_locale
    end

    context "given a valid value to pull" do

      it "returns the correct category" do
        expected_val = categories.sample["en"]
        expect(i18n_value_in_array(categories, expected_val)).to eq(expected_val)
      end

      it "is case insensitive" do
        expected_map = maps.sample["en"]
        expect(i18n_value_in_array(maps, expected_map.downcase)).to eq(expected_map)
      end

      it "considers the current locale when returning" do
        I18n.locale = "ko"
        expect(i18n_value_in_array(categories, "Solo")).to eq("솔로")
      end

    end

    context "given invalid values to pull" do

      it "handles an invalid item" do
        expect(i18n_value_in_array(categories, "#ShockTheWorld")).to be_nil
      end

      it "handles an empty string" do
        expect(i18n_value_in_array(categories, "")).to be_nil
      end

      it "handles nil" do
        expect(i18n_value_in_array(categories, nil)).to be_nil
      end

    end
  end
end
