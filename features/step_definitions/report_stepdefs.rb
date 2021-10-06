Given /a report for (?:the )?(\w+) "([^"\n]+)"(?: by ([\d\p{L}_-]*[#\d]*))?/ do |model, identifier, reporter|
  report = create(:report, concerns_model: model)
  if reporter.present?
    report.user = User.find_by_username(reporter)
  end

  report.concerns_id = fetch_model(model, identifier).id

  report.save!
  @current_report = report
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
