class AddVersionToPosts < ActiveRecord::Migration[5.2]
  def change
    add_column :posts, :version, :string
  end
end
