desc "Update post comments count"
task :update_post_comments_count => :environment do
  Comment.where.not(parent_id: nil).each do |comment|
    next if Comment.where(id: comment.parent_id).any?

    comment.destroy
  end

  Post.all.each do |post|
    Post.reset_counters(post.id, :comments)
  end
end
