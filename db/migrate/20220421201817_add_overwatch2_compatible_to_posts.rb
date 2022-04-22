class AddOverwatch2CompatibleToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :overwatch_2_compatible, :boolean, default: false
  end
end
