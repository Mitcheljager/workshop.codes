class IndexForeignKeysInPosts < ActiveRecord::Migration[6.0]
  def change
    add_index :posts, :user_id
  end
end
