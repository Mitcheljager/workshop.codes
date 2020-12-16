class AddPtrToPosts < ActiveRecord::Migration[6.0]
  def change
    add_column :posts, :ptr, :boolean, default: 0
  end
end
