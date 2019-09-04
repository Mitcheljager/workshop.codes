class AddIndexesToPosts < ActiveRecord::Migration[5.2]
  def change
    add_index :posts, :title
    add_index :posts, :code
    add_index :posts, :categories
    add_index :posts, :heroes
    add_index :posts, :maps
    add_index :posts, :tags

    add_foreign_key :posts, :users
  end
end
