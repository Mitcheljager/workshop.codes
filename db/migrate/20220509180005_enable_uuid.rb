class EnableUuid < ActiveRecord::Migration[6.1]
  def change
    enable_extension 'pgcrypto' unless extensions.include? 'pgcrypto'
  end
end
