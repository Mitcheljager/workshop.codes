class CreateProjects < ActiveRecord::Migration[6.1]
  def change
    create_table :projects do |t|
      t.integer :user_id
      t.string :title
      t.text :content
      t.string :uuid

      t.timestamps
    end
  end
end
