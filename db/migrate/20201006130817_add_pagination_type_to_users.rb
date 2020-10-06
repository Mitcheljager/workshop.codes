class AddPaginationTypeToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :pagination_type, :integer, default: 0
  end
end
