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
        code: Faker::Alphanumeric.alpha(5),
        description: Faker::Markdown.sandwich(10, 4),
        version: Faker::App.version,
        categories: ["Team Deathmatch", "Solo"],
        heroes: ["Mei"],
        maps: ["Havana"],
        tags: Faker::Lorem.word
      )
    end
  end

  task fakeit_snippets: :environment do
    200.times do
      Snippet.create!(
        user_id: 1,
        unique_id: Faker::Alphanumeric.alpha(8),
        title: Faker::Lorem.sentence,
        content: Faker::Alphanumeric.alpha(5),
        description: Faker::Markdown.sandwich(10, 4)
      )
    end
  end
end
