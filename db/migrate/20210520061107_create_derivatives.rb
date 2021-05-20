class CreateDerivatives < ActiveRecord::Migration[6.1]
  def change
    create_table :derivatives do |t|
      t.integer :source_id
      t.integer :derivation_id

      t.timestamps
    end
  end
end
