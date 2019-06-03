class AddFavoritesCountToPosts < ActiveRecord::Migration[5.2]
  def change
    add_column :posts, :favorites_count, :integer, default: 0
    add_index :posts, :favorites_count
  end
end
