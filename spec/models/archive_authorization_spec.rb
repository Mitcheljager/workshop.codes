require 'rails_helper'

RSpec.describe ArchiveAuthorization, type: :model do
  describe "validations" do
    subject { create(:archive_authorization) }

    it { should validate_presence_of :code }
    it { should validate_uniqueness_of(:code).case_insensitive }

    it { should validate_presence_of :bnet_id }
    it { should validate_numericality_of(:bnet_id).
      only_integer.
      is_greater_than(0)
    }
    it { should validate_length_of(:bnet_id).is_at_least(6) }
  end
end
