class DropWhileYouWaits < ActiveRecord::Migration[6.1]
  def up
    drop_table :while_you_waits
  end

  def down
    fail ActiveRecord::IrreversibleMigration
  end
end
