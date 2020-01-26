class AddConernsActionToStatistics < ActiveRecord::Migration[6.0]
  def change
    add_column :statistics, :concerns_action, :string, default: "show"
  end
end
