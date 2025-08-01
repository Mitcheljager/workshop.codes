desc "Add last_revision_created_at to posts"
task add_last_revision_created_at_to_posts: :environment do
  @posts = Post.all

  @posts.each do |post|
    post.last_revision_created_at = post.revisions.any? ? post.revisions.last.created_at : post.updated_at
    post.save(touch: false)
  end
end
