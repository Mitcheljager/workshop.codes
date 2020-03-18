class AddFeaturedPostsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :featured_posts, :string
  end
end
