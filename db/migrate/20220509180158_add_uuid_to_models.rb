class AddUuidToModels < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :uuid, :string, limit: 36, unique: true
  end
end
