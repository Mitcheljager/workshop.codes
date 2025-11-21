namespace :db do
  desc "Fakes 200 posts from the first created user"
  task fakeit: :environment do
    200.times do
      min_players = Faker::Number.within(range: 1..12)
      Post.create!(
        user_id: 1,
        title: Faker::Lorem.sentence,
        code: Faker::Alphanumeric.alpha(number: 5),
        description: Faker::Markdown.sandwich(sentences: 10, repeat: 4),
        version: Faker::App.version,
        categories: ["Team Deathmatch", "Solo"],
        heroes: ["Mei"],
        maps: ["Havana"],
        tags: Faker::Lorem.word,
        min_players: min_players,
        max_players: Faker::Number.within(range: min_players..12)
      )
    end
  end
end
