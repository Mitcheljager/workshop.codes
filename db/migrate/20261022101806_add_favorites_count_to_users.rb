class AddFavoritesCountToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :favorites_count, :integer, default: 0
  end
end
