class AddVisibleToRevisions < ActiveRecord::Migration[5.2]
  def change
    add_column :revisions, :visible, :boolean, default: 1
  end
end
