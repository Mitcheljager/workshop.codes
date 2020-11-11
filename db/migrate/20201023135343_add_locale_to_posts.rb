class AddLocaleToPosts < ActiveRecord::Migration[6.0]
  def change
    add_column :posts, :locale, :string, default: "en"
  end
end
