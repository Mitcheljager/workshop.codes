FactoryBot.define do
  factory :post do
    title { Faker::Lorem.sentence }
    code { Faker::Alphanumeric.alphanumeric(number: 5).upcase }
    user_id { Faker::Number.number(10) }
    description { Faker::Markdown.sandwich(sentences: 6, repeat: 3) }
    categories { ApplicationHelper.categories.collect{ |a| a["en"] }.sample(2) }
    heroes { ApplicationHelper.heroes.collect{ |a| a["en"] }.sample(3) }
    maps { ApplicationHelper.maps.collect{ |a| a["en"] }.sample(3) }
    user
  end
end
