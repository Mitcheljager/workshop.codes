class AddCustomCssToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :custom_css, :text
  end
end
