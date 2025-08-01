FactoryBot.define do
  factory :post do
    title { Faker::Lorem.sentence(word_count: 3, supplemental: false, random_words_to_add: 4) }
    code { Faker::Alphanumeric.unique.alphanumeric(number: 5).upcase }
    user
    description { Faker::Markdown.sandwich(sentences: 6, repeat: 3) }
    categories { ApplicationHelper.categories.sample(2) }
    heroes { ApplicationHelper.heroes.collect { |a| a["name"] }.sample(3) }
    maps { ApplicationHelper.maps.collect { |a| a["name"] }.sample(3) }
    version { Faker::App.semantic_version }
    last_revision_created_at { Time.now }
    hotness { Faker::Number.between(from: 1, to: 200) }
    min_players { Faker::Number.between(from: 1, to: 12) }
    max_players { Faker::Number.between(from: min_players, to: 12) }
  end
end
