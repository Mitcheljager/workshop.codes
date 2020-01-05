class AddContentTypeToNotifications < ActiveRecord::Migration[5.2]
  def change
    add_column :notifications, :content_type, :integer, default: 0
    add_column :notifications, :concerns_model, :string, default: "post"
    add_column :notifications, :concerns_id, :interger, default: 0
  end
end
