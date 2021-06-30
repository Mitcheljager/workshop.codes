FactoryBot.define do
  factory :derivative do
    source { Post.first.presence || create(:post) }
    source_code { source.code }
    derivation { Post.count > 1 ? Post.last : create(:post) }
  end
end
