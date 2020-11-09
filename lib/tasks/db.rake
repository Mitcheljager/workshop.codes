namespace :db do
  desc "TODO"
  task repopulate: :environment do
  end

  desc "TODO"
  task fakeit: :environment do
    200.times do
      Post.create!(
        user_id: 1,
        title: Faker::Lorem.sentence,
        code: Faker::Alphanumeric.alpha(number: 5),
        description: Faker::Markdown.sandwich(sentences: 10, repeat: 4),
        version: Faker::App.version,
        categories: ["Team Deathmatch", "Solo"],
        heroes: ["Mei"],
        maps: ["Havana"],
        tags: Faker::Lorem.word
      )
    end
  end
end
