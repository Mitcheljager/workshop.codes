# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

User.destroy_all
User.create(id: 0, username: "admin", password: "password", level: :admin)
User.create(id: 1, username: "user", password: "password")
User.create(id: 2, username: "test", password: "password")

Post.destroy_all
1000.times do |i|
  min_players = Faker::Number.within(range: 1..12)
  Post.create(
    id: i,
    created_at: 1.year.ago,
    updated_at: Faker::Date.between(from: 1.year.ago, to: Date.today),
    last_revision_created_at: Faker::Date.between(from: 1.year.ago, to: Date.today),
    title: Faker::Lorem.sentence(word_count: 3, supplemental: false, random_words_to_add: 4),
    code: Faker::Alphanumeric.alphanumeric(number: 5).upcase,
    user_id: Faker::Number.between(from: 0, to: 2),
    description: Faker::Markdown.sandwich(sentences: 6, repeat: 3),
    categories: ApplicationHelper.categories.collect{ |a| a }.sample(2),
    heroes: ApplicationHelper.heroes.collect{ |a| a["name"] }.sample(3),
    maps: ApplicationHelper.maps.collect{ |a| a["name"] }.sample(3),
    version: Faker::App.semantic_version,
    hotness: Faker::Number.between(from: 1, to: 200),
    min_players: min_players,
    max_players: Faker::Number.within(range: min_players..12)
  )
end

Comment.destroy_all
1000.times do
  Comment.create(
    user_id: Faker::Number.between(from: 0, to: 2),
    post_id: Faker::Number.between(from: 0, to: 99),
    content: Faker::Markdown.sandwich(sentences: 2, repeat: 2)
  )
end

Favorite.destroy_all
1000.times do
  Favorite.create(
    created_at: Faker::Date.between(from: 1.year.ago, to: Date.today),
    user_id: Faker::Number.between(from: 0, to: 2),
    post_id: Faker::Number.between(from: 0, to: 99)
  )
end
