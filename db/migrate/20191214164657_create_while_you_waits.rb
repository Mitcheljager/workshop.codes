class CreateWhileYouWaits < ActiveRecord::Migration[5.2]
  def change
    create_table :while_you_waits do |t|
      t.integer :post_id
      t.string :category

      t.timestamps
    end
  end
end
