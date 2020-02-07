class IndexForeignKeysInRememberTokens < ActiveRecord::Migration[6.0]
  def change
    add_index :remember_tokens, :user_id
  end
end
