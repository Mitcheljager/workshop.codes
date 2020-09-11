class CreateReports < ActiveRecord::Migration[6.0]
  def change
    create_table :reports do |t|
      t.integer :user_id
      t.string :concerns_model
      t.integer :concerns_id
      t.text :content
      t.string :category
      t.integer :status, default: 0

      t.timestamps
    end
  end
end
