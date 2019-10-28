class AddPrivateToSnippets < ActiveRecord::Migration[5.2]
  def change
    add_column :snippets, :private, :boolean, default: 0
  end
end
