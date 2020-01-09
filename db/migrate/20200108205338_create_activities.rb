class CreateActivities < ActiveRecord::Migration[5.2]
  def change
    create_table :activities do |t|
      t.integer :user_id
      t.integer :content_type
      t.text :properties

      t.timestamps
    end
  end
end
