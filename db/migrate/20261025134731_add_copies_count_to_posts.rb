class AddCopiesCountToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :copies_count, :integer, default: 0
  end
end
