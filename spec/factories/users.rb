FactoryBot.define do
  factory :user do
    username { Faker::Name.first_name }
    password { BCrypt::Password.create("password") }
  end
end
