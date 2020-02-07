class IndexForeignKeysInRevisions < ActiveRecord::Migration[6.0]
  def change
    add_index :revisions, :post_id
  end
end
