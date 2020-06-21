class CreateWikiArticles < ActiveRecord::Migration[6.0]
  def change
    create_table :wiki_articles do |t|
      t.string :title
      t.text :content
      t.string :version
      t.boolean :approved
      t.string :tags
      t.integer :category_id

      t.timestamps
    end
  end
end
