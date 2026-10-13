class RemovePgheroQueryStats < ActiveRecord::Migration[8.0]
  def up
      drop_table :pghero_query_stats
    end

    def down
      raise ActiveRecord::IrreversibleMigration
    end
end
