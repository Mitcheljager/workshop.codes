class DestroySnippetsTable < ActiveRecord::Migration[5.2]
  def change
    drop_table :snippets
  end
end
