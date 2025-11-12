desc "Create search indexes"
task create_search_indexes: :environment do
  Post.__elasticsearch__.create_index! force: true
  Post.import(force: true)

  User.__elasticsearch__.create_index! force: true
  User.with_at_least_one_post.import(force: true)

  Wiki::Article.__elasticsearch__.create_index! force: true
  Wiki::Article.latest_per_group.import(force: true)
end
