class CreateWikiEdits < ActiveRecord::Migration[6.0]
  def change
    create_table :wiki_edits do |t|
      t.integer :user_id
      t.string :article_id
      t.integer :content_type
      t.text :notes
      t.boolean :approved

      t.timestamps
    end
  end
end
