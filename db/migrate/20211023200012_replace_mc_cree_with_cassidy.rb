class ReplaceMcCreeWithCassidy < ActiveRecord::Migration[6.1]
  def up
    Post.all.each do |post|
      updated_heroes = post.heroes.map { |hero| hero.gsub("McCree", "Cassidy") }

      post.update_columns(heroes: updated_heroes)
    end
  end

  def down
    Post.all.each do |post|
      updated_heroes = post.heroes.map { |hero| hero.gsub("Cassidy", "McCree") }

      post.update_columns(heroes: updated_heroes)
    end
  end
end
