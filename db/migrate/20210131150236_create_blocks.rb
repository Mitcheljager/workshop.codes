class CreateBlocks < ActiveRecord::Migration[6.1]
  def change
    create_table :blocks do |t|
      t.string :content_type
      t.integer :content_id
      t.integer :user_id
      t.string :name
      t.text :properties
      t.integer :position

      t.timestamps
    end
  end
end
