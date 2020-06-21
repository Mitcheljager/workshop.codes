class CreateWikiEdits < ActiveRecord::Migration[6.0]
  def change
    create_table :wiki_edits do |t|
      t.integer :user_id
      t.string :from_version
      t.string :to_version
      t.string :concerns_model
      t.integer :concerns_id

      t.timestamps
    end
  end
end
