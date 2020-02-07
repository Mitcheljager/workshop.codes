class IndexForeignKeysInFavorites < ActiveRecord::Migration[6.0]
  def change
    add_index :favorites, :post_id
  end
end
