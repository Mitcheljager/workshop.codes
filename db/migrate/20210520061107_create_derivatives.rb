class CreateDerivatives < ActiveRecord::Migration[6.1]
  def change
    create_table :derivatives do |t|
      t.integer :source_id
      t.integer :derivation_id
      t.string :source_code

      t.timestamps
    end

    add_index :derivatives, [:source_id, :derivation_id], unique: true, where: 'source_id IS NOT NULL'
    add_index :derivatives, [:source_code, :derivation_id], unique: true
  end
end
