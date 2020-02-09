class AddModelIdToStatistics < ActiveRecord::Migration[6.0]
  def change
    add_column :statistics, :model_id, :integer
  end
end
