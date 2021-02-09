require 'rails_helper'

RSpec.describe ReportsHelper, type: :helper do

  describe "report_model_property helper" do

    context "passed a normal report with properties" do

      before(:each) do
        @report = instance_double("Report", :properties => {"post" => {"code" => "AJERA"}})
      end

      it "correctly returns information about the intended model" do
        expect(report_model_property(@report, "post", "code")).to eq("AJERA")
      end

      it "returns an empty string if questioned about a model it does not concern" do
        expect(report_model_property(@report, "edit", "code")).to eq("")
      end

    end

    context "passed a legacy report with no properties" do

      before(:each) do
        @report = instance_double("Report", :properties => nil)
      end

      it "does not error when asked to access a model's properties" do
        expect(report_model_property(@report, "post", "code")).to eq("")
      end

    end

  end

end
