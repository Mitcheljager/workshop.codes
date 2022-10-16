class EditorController < ApplicationController
  before_action do
    redirect_to login_path unless current_user
  end

  def index
    @projects = current_user.projects.order(updated_at: :desc).select("uuid", "title", "content")
    @actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    @values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))
    @defaults = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "defaults.yml")))
  end
end
