class EditorController < ApplicationController
  def index
    @projects = current_user.present? ? current_user.projects.order(updated_at: :desc).select("uuid", "title", "content") : []
    @actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    @values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))
    @defaults = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "defaults.yml")))
  end
end
