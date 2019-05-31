class CreateRememberTokens < ActiveRecord::Migration[5.2]
  def change
    create_table :remember_tokens do |t|
      t.integer :user_id
      t.string :token

      t.timestamps
    end
  end
end
