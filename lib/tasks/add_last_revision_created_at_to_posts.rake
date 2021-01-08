desc "Add last_revision_created_at to posts"
task :add_last_revision_created_at_to_posts => :environment do
  Post.all.each do |post|
    revision = post.revisions.last

    if revision.present?
      post.update_column(:last_revision_created_at, revision.created_at)
    else
      post.update_column(:last_revision_created_at, post.created_at)
    end
  end
end
