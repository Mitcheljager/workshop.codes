class CreateRevisions < ActiveRecord::Migration[5.2]
  def change
    create_table :revisions do |t|
      t.integer :post_id
      t.string :code
      t.string :version
      t.text :description

      t.timestamps
    end
  end
end
