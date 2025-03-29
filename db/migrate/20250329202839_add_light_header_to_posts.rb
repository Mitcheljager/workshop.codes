class AddLightHeaderToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :light_header, :boolean, default: false
  end
end
