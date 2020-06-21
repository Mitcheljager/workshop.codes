class CreateWikiCategories < ActiveRecord::Migration[6.0]
  def change
    create_table :wiki_categories do |t|
      t.string :name
      t.string :slug

      t.timestamps
    end
  end
end
