FactoryBot.define do
  factory :user do
    username { Faker::Name.unique.first_name }
    password { BCrypt::Password.create("password") }
  end
end
