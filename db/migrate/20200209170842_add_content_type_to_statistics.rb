class AddContentTypeToStatistics < ActiveRecord::Migration[6.0]
  def change
    add_column :statistics, :content_type, :integer, default: 0
  end
end
