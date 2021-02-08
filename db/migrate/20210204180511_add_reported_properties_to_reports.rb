class AddReportedPropertiesToReports < ActiveRecord::Migration[6.1]
  def change
    add_column :reports, :properties, :text
  end
end
