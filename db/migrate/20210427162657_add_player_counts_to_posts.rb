class AddPlayerCountsToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :min_players, :integer, default: nil
    add_column :posts, :max_players, :integer, default: nil
  end
end
