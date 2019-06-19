class CreateSnippets < ActiveRecord::Migration[5.2]
  def change
    create_table :snippets do |t|
      t.integer :user_id
      t.string :unique_id
      t.string :title
      t.text :content
      t.text :description

      t.timestamps
    end
  end
end
