class CreateWikiArticles < ActiveRecord::Migration[6.0]
  def change
    create_table :wiki_articles do |t|
      t.string :title
      t.string :subtitle
      t.text :content
      t.string :slug
      t.text :tags
      t.integer :category_id
      t.string :group_id

      t.timestamps
    end
  end
end
