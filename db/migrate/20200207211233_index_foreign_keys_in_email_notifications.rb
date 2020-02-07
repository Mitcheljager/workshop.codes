class IndexForeignKeysInEmailNotifications < ActiveRecord::Migration[6.0]
  def change
    add_index :email_notifications, :post_id
  end
end
