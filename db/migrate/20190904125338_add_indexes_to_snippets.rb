class AddIndexesToSnippets < ActiveRecord::Migration[5.2]
  def change
    add_index :snippets, :title
    add_index :snippets, :unique_id

    add_foreign_key :snippets, :users
  end
end
