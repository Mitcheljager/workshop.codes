class AddUnlistedToPosts < ActiveRecord::Migration[6.0]
  def change
    add_column :posts, :unlisted, :boolean, default: false
  end
end
