class CreateStatistics < ActiveRecord::Migration[5.2]
  def change
    create_table :statistics do |t|
      t.integer :timeframe
      t.integer :value
      t.datetime :on_date
      t.string :concerns_model, default: "post"
      t.integer :concerns_id

      t.timestamps
    end
  end
end
