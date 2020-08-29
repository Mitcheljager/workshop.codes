class AddNiceUrlToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :nice_url, :string
  end
end
