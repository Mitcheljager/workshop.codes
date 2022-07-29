class ReplacePushMapNames < ActiveRecord::Migration[6.1]
  def up
    Post.all.each do |post|
      updated_maps = post.maps.map { |map| map.gsub("Rome", "Colosseo") }
      updated_maps = updated_maps.map { |map| map.gsub("Toronto", "New Queen Street") }

      puts updated_maps

      post.update_columns(maps: updated_maps)
    end
  end

  def down
    Post.all.each do |post|
      updated_maps = post.maps.map { |map| map.gsub("Colosseo", "Rome") }
      updated_maps = updated_maps.map { |map| map.gsub("New Queen Street", "Toronto") }

      post.update_columns(maps: updated_maps)
    end
  end
end
