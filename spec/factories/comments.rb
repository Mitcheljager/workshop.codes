FactoryBot.define do
  factory :comment do
    user
    post
    parent_id { nil }
    content { "MyText" }
  end
end
