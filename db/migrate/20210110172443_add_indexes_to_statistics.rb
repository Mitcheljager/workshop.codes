class AddIndexesToStatistics < ActiveRecord::Migration[6.0]
  def change
    add_index :statistics, :model_id
    add_index :statistics, :content_type
    add_index :statistics, :on_date
  end
end
