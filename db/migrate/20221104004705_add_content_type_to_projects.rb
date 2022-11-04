class AddContentTypeToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :content_type, :int, default: 0
  end
end
