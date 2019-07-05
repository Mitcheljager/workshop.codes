class AddImpressionsCountToPostsAndSnippets < ActiveRecord::Migration[5.2]
  def change
    add_column :posts, :impressions_count, :integer, default: 0
    add_column :snippets, :impressions_count, :integer, default: 0
  end
end
