desc "Set all posts marked as overwatch_2_compatible to unlisted"
task :unlist_overwatch_2 => :environment do
  @posts = Post.where(overwatch_2_compatible: true, private: false)

  @posts.each do |post|
    post.update_column(:unlisted, true)
  end
end
