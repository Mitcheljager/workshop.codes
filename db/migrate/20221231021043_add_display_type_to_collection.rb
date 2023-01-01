class AddDisplayTypeToCollection < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :display_type, :integer, default: 0
  end
end
