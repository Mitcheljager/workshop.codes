class AddProviderProfileImageToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :provider_profile_image, :string
  end
end
