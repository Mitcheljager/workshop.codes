require 'rails_helper'
require './spec/support/user_helpers'

RSpec.configure do |c|
  c.include Helpers::Users
end

RSpec.describe "AdminReports", type: :feature do
  include Capybara::DSL

  let!(:post_author) { create(:user, password: "password") }
  let!(:comment_author) { create(:user) }
  let!(:admin) { create(:user, password: "password", level: :admin) }
  let!(:post) { create(:post, user_id: post_author.id) }
  let!(:comment) { create(:comment, user_id: comment_author.id, post: post) }

  before(:each) do
    sign_in_as(admin, "password")
  end

  describe "access control" do
    it "grants access to reports for admins" do
      visit admin_reports_path
      expect(body).to include("Admin Dashboard")
      expect(body).to have_content(/Reports/i)
    end

    it "does not grant access to a normal user" do
      sign_in_as(post_author, "password")
      visit admin_reports_path
      expect(body).not_to include("Admin Dashboard")
      expect(body).not_to have_content(/Reports/i)
    end
  end

  describe "handling potentially invalid reports" do
    context "in post reports" do
      it "works when the relevant post has been deleted" do
        report = create(:report,
          concerns_model: :post,
          concerns_id: post.id,
          properties: {
            "post" => { "title" => post.title, "code" => post.code }
          }
        )
        post.destroy

        visit admin_report_path(id: report.id)
        expect(page).to have_content(report.content)
        expect(page).to have_content(post.title)
      end
    end

    context "in comment reports" do
      it "works when the relevant comment has been deleted" do
        report = create(:report,
          concerns_model: :comment,
          concerns_id: comment.id,
          properties: {
            "comment" => { "content" => comment.content }
          }
        )
        comment.destroy

        visit admin_report_path(id: report.id)
        expect(page).to have_content(report.content)
        expect(page).to have_content(comment.content)
      end

      it "works when the relevant comment's parent has been deleted" do
        report = create(:report,
          concerns_model: :comment,
          concerns_id: comment.id,
          properties: {
            "comment" => { "content" => comment.content }
          }
        )
        post.destroy

        visit admin_report_path(id: report.id)
        expect(page).to have_content(report.content)
        expect(page).to have_content(comment.content)
      end
    end

    context "with an invalid concerned object" do
      it "still shows the report page" do
        concerns_model = "comment; --"
        report = create(:report,
          concerns_model: concerns_model
        )

        visit admin_report_path(id: report.id)
        expect(page).to have_content("Invalid concerns_model #{concerns_model}")
        expect(page).to have_content(report.content)
      end
    end
  end
end
