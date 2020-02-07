class IndexForeignKeysInForgotPasswordTokens < ActiveRecord::Migration[6.0]
  def change
    add_index :forgot_password_tokens, :user_id
  end
end
