require "securerandom"

class AddUuidToModels < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :uuid, :uuid, default: "gen_random_uuid()"
    add_index :users, :uuid, unique: true
  end
end
