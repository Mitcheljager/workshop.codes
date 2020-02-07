class IndexForeignKeysInNotifications < ActiveRecord::Migration[6.0]
  def change
    add_index :notifications, :concerns_id
    add_index :notifications, :user_id
  end
end
