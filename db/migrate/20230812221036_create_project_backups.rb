class CreateProjectBackups < ActiveRecord::Migration[6.1]
  def change
    create_table :project_backups do |t|
      t.string :uuid, index: true
      t.string :project_uuid, index: true
      t.string :title
      t.text :content

      t.timestamps
    end
  end
end
