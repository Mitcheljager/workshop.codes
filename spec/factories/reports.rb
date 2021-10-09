FactoryBot.define do
  factory :report do
    category { Faker::Lorem.sentence(word_count: 4, supplemental: false, random_words_to_add: 4) }
    content { Faker::Lorem.paragraph }
  end
end
