class CreateProjectBackups < ActiveRecord::Migration[6.1]
  def change
    create_table :project_backups do |t|
      t.string :uuid
      t.string :parent_uuid
      t.string :title
      t.text :content

      t.timestamps
    end
  end
end
