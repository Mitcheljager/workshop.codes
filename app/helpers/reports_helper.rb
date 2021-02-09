module ReportsHelper
  def report_options
    [
      "This code does not work",
      "This code is made by someone else",
      "This is an edit of someone else's code, but no credit is given",
      "This code is inappropriate/offensive",
      "The image(s) used in this post are inappropriate/offensive",
      "This is spam",
      "Other"
    ]
  end

  def report_model_property(report, model, property)
    if report_has_model_property?(report, model, property)
      return report.properties[model][property]
    else
      return ""
    end
  end

  private
  def report_has_model_property?(report, model, property)
    return false unless report.respond_to? :properties
    return false unless report.properties.respond_to?(:[])
    return false unless report.properties[model]
    return false unless report.properties[model].respond_to?(:[])
    report.properties[model][property]
  end
end
