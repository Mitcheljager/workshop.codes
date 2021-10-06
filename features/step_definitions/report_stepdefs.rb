Given /a report for (?:the )?(\w+) "([^"\n]+)"(?: by ([\d\p{L}_-]*[#\d]*))?/ do |model, identifier, reporter|
  report = create(:report, concerns_model: model)
  if reporter.present?
    report.user = User.find_by_username(reporter)
  end

  report.concerns_id = fetch_model(model, identifier).id

  report.save!
  @current_report = report
end

When "I open the {word} report about the {word} {string}" do |qualifier, model, identifier|
  object = fetch_model(model, identifier)

  reports_for = Report.where(concerns_model: model, concerns_id: object.id)
  case qualifier
  when "latest"
    report = reports_for.order(created_at: :desc).first
  else
    fail "Don't know how to find the #{ qualifier } report"
  end
  fail "No reports found for #{ object }" unless report.present?

  visit admin_report_path(report)
  @current_report = report
end

Then "I should be able to {word} the report" do |action|
  click_on action.capitalize
end

Then "I should be on the page for the report" do
  expect(current_path).to eq admin_report_path(@current_report)
end

Then "I should be on the reports queue page" do
  expect(current_path).to eq admin_reports_path
end

def fetch_model(model, identifier)
  case model
  when "post"
    result = Post.find_by_title(identifier)
  when "comment"
    result = Comment.find_by_content(identifier)
  else
    fail "Reports are not currently supported for model '#{ model }'"
  end
  fail "#{ model.capitalize } for identifier \"#{ identifier }\" not found" unless result.present?
  result
end
