class AddNiceUrlToCollections < ActiveRecord::Migration[6.0]
  def change
    add_column :collections, :nice_url, :string
  end
end
