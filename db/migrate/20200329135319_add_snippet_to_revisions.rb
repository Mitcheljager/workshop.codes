class AddSnippetToRevisions < ActiveRecord::Migration[6.0]
  def change
    add_column :revisions, :snippet, :text
  end
end
