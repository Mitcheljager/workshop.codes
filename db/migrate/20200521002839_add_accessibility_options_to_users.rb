class AddAccessibilityOptionsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :high_contrast, :boolean, default: false
    add_column :users, :large_fonts, :boolean, default: false
    add_column :users, :simple_view, :boolean, default: false
  end
end
