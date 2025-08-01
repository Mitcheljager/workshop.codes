class AddReportedPropertiesToReports < ActiveRecord::Migration[6.1]
  def change
    add_column :reports, :properties, :text, default: "[]"
  end
end
