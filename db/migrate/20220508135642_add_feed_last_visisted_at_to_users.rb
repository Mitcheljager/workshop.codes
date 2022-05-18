class AddFeedLastVisistedAtToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :feed_last_visited_at, :datetime
  end
end
