class RemoveSimpleViewFromUsers < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :simple_view, :boolean
  end
end
