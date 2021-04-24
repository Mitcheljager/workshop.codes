class AddDraftToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :draft, :boolean, default: false
  end
end
