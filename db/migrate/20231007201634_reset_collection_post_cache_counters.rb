class ResetCollectionPostCacheCounters < ActiveRecord::Migration[6.1]
  def up
    Collection.all.each do |collection|
      Collection.reset_counters(collection.id, :posts)
    end
  end

  def down
    # no rollback needed
  end
end
