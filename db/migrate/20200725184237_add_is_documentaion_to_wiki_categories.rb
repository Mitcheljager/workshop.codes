class AddIsDocumentaionToWikiCategories < ActiveRecord::Migration[6.0]
  def change
    add_column :wiki_categories, :is_documentation, :boolean, default: false
  end
end
