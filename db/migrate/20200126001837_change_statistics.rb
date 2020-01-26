class ChangeStatistics < ActiveRecord::Migration[6.0]
  def change
    remove_column :statistics, :concerns_id
    remove_column :statistics, :concerns_model
    remove_column :statistics, :concerns_action
    add_column :statistics, :properties, :text, default: "{}"
  end
end
