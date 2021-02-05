class CreateWebhookValues < ActiveRecord::Migration[6.1]
  def change
    create_table :webhook_values do |t|
      t.string :name
      t.string :value

      t.timestamps
    end
  end
end
