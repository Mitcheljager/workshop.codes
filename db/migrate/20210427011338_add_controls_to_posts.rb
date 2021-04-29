class AddControlsToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :controls, :text, default: "{}"
  end
end
