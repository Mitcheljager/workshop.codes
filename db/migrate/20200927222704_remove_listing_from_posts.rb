class RemoveListingFromPosts < ActiveRecord::Migration[6.0]
  def change
    remove_column :posts, :listings_count
  end
end
