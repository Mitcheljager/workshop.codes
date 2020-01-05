desc "Create search indexes"
task :create_search_indexes => :environment do
  Post.__elasticsearch__.create_index! force: true
  Post.import(force: true)
end
