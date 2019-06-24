class AddDifficultyToSnippets < ActiveRecord::Migration[5.2]
  def change
    add_column :snippets, :proficiency, :integer, default: 0
  end
end
