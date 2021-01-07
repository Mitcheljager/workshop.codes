class CreateBadges < ActiveRecord::Migration[6.0]
  def change
    create_table :badges do |t|
      t.integer :badge_id
      t.integer :user_id

      t.timestamps
    end
  end
end
