class ChangePostControlsDefault < ActiveRecord::Migration[6.1]
  def change
    change_column_default :posts, :controls, from: "{}", to: "[]"
  end
end
