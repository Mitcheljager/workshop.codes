class AddDescriptionToCollections < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :description, :text
  end
end
