class AddProjectToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :project_uuid, :string
    add_index :posts, :project_uuid
  end
end
