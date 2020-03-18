class AddDescriptionToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :description, :string
  end
end
