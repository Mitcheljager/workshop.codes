class AddSendEmailOnNotificationToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :send_email_on_notification, :boolean, default: 0
  end
end
