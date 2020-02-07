class IndexForeignKeysInWhileYouWaits < ActiveRecord::Migration[6.0]
  def change
    add_index :while_you_waits, :post_id
  end
end
