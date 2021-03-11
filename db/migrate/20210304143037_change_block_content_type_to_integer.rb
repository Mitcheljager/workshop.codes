class ChangeBlockContentTypeToInteger < ActiveRecord::Migration[6.1]
  def up
    change_column :blocks, :content_type, :integer, using: "content_type::integer", default: 0
  end

  def down
    change_column :blocks, :content_type, :string, using: "content_type::string"
  end
end
