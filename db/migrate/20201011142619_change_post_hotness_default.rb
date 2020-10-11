class ChangePostHotnessDefault < ActiveRecord::Migration[6.0]
  def change
    change_column_default :posts, :hotness, 1
  end
end
