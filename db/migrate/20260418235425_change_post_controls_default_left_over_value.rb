class ChangePostControlsDefaultLeftOverValue < ActiveRecord::Migration[7.1]
  def up
    Post.where(controls: "{}").update_all(controls: "[]")
  end
end
