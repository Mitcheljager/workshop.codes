FactoryBot.define do
  factory :block do
    content_type { "MyString" }
    properties { "MyText" }
    content_id { 1 }
    position { 1 }
  end
end
