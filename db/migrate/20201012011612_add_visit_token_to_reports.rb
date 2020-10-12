class AddVisitTokenToReports < ActiveRecord::Migration[6.0]
  def change
    add_column :reports, :visit_token, :string
  end
end
