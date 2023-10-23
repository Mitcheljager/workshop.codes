class AddTopHotnessToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :top_hotness, :integer, default: 1
    add_column :posts, :top_hotness_at, :datetime
  end
end
