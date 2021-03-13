class AddImmortalToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :immortal, :boolean, default: false
  end
end
