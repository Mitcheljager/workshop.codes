class AddPlayerCountsToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :min_players, :integer, default: 1
    add_column :posts, :max_players, :integer, default: 12
  end
end
