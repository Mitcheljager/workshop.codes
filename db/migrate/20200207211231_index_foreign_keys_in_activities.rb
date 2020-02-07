class IndexForeignKeysInActivities < ActiveRecord::Migration[6.0]
  def change
    add_index :activities, :user_id
  end
end
