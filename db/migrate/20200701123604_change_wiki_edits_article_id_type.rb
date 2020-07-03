class ChangeWikiEditsArticleIdType < ActiveRecord::Migration[6.0]
  def change
    change_column :wiki_edits, :article_id, :integer, using: "article_id::integer"
  end
end
