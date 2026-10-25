task update_post_copies_count: :environment do
  total =  Post.count

  Post.select(:id, :copies_count).find_each(batch_size: 500).with_index do |post, index|
    puts "#{index + 1}/#{total}"

    copies_count = Statistic.where(content_type: :copy, model_id: post.id, timeframe: :daily).where(content_type: :copy).pluck(:value).sum
    post.update_column(:copies_count, copies_count)
  end
end
