desc "Archive unresolved reports which no longer reference a valid post"
task :archive_invalid_reports => :environment do
  @reports = Report.where(status: 0)

  @reports.each do |report|
    if report.concerns_model == 'post' && Post.where(id: report.concerns_id).empty? then
      report.archived!
    end
  end
end
