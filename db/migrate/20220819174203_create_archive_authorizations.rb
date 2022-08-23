class CreateArchiveAuthorizations < ActiveRecord::Migration[6.1]
  def change
    create_table :archive_authorizations do |t|
      t.string :code, null: false, index: { unique: true }
      t.string :bnet_id

      t.timestamps
    end
  end
end
