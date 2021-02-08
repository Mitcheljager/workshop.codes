class AddReportedUserToReports < ActiveRecord::Migration[6.1]
  def change
    add_column :reports, :reported_user_id, :integer
  end
end
