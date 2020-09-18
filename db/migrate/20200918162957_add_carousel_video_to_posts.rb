class AddCarouselVideoToPosts < ActiveRecord::Migration[6.0]
  def change
    add_column :posts, :carousel_video, :string
  end
end
