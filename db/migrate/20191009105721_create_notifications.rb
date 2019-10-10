class CreateNotifications < ActiveRecord::Migration[5.2]
  def change
    create_table :notifications do |t|
      t.integer :user_id
      t.integer :has_been_read, default: 0
      t.string :content
      t.string :go_to

      t.timestamps
    end
  end
end
