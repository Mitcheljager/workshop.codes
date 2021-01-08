class AddLastRevisionCreatedAtToPosts < ActiveRecord::Migration[6.0]
  def change
    add_column :posts, :last_revision_created_at, :datetime
  end
end
