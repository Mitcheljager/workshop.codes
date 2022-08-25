FactoryBot.define do
  factory :archive_authorization do
    code { Faker::Alphanumeric.unique.alphanumeric(number: 5).upcase }
    bnet_id { Faker::Number.number(digits: 8).to_s }
  end
end
