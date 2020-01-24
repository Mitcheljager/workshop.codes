class CreateForgotPasswordTokens < ActiveRecord::Migration[6.0]
  def change
    create_table :forgot_password_tokens do |t|
      t.integer :user_id
      t.string :token

      t.timestamps
    end
  end
end
