desc "Create search indexes"
task :create_search_indexes => :environment do
  Post.__elasticsearch__.create_index! force: true
  Post.import(force: true)

  Wiki::Article.__elasticsearch__.create_index! force: true
  Wiki::Article.import(force: true)
end
