class AddParentIdToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :linked_id, :integer
  end
end
