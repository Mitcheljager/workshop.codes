class AddPostsCountToCollections < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :posts_count, :integer
  end
end
