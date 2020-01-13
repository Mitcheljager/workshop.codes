class CreateEmailNotifications < ActiveRecord::Migration[5.2]
  def change
    create_table :email_notifications do |t|
      t.text :email_ciphertext
      t.integer :post_id
      t.integer :content_type

      t.timestamps
    end
  end
end
