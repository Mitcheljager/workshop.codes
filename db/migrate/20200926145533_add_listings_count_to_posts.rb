class AddListingsCountToPosts < ActiveRecord::Migration[6.0]
  def change
    add_column :posts, :listings_count, :integer, default: 0
  end
end
