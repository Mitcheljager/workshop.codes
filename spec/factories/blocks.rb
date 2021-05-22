FactoryBot.define do
  factory :block do
    content_type { "profile" }
    properties { "MyText" }
    content_id { 1 }
    position { 1 }
    name { Faker::Name.first_name }
    user
  end
end
