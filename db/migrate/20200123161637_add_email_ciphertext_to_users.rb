class AddEmailCiphertextToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :email_ciphertext, :text
  end
end
