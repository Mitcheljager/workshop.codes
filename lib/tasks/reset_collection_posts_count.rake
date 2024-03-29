desc "Reset posts_count counter_cache for all collections"
task reset_collection_posts_count: :environment do
  Collection.find_each do |collection|
    Collection.reset_counters(collection.id, :posts)
  end
end
