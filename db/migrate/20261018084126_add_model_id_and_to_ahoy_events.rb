class AddModelIdAndToAhoyEvents < ActiveRecord::Migration[8.0]
  def change
    add_column :ahoy_events, :model_id, :integer

    add_index  :ahoy_events, [:model_id]
  end
end
