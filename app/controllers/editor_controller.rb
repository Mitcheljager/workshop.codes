class EditorController < ApplicationController
  def index; end

  def data
    respond_to do |format|
      format.json {
        response = Rails.cache.fetch("editor_data", expires_in: 1.day) do
          events = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "events.yml")))
          actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
          values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))
          defaults = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "defaults.yml")))
          constants = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "constants.yml")))

          response = {
            events: events,
            actions: actions,
            values: values,
            defaults: defaults,
            constants: constants,
            maps: maps,
            heroes: heroes,
          }
        end

        current_user_projects(:workshop_codes)
        response["current_user_projects"] = @projects

        render json: response, layout: false
      }
    end
  end

  def zez_ui
    respond_to do |format|
      format.html { render layout: "csrf_only" }
      format.json {
        current_user_projects(:zez_ui)
        render json: @projects, layout: false
      }
    end
  end

  private

  def current_user_projects(content_type)
    @projects = current_user.present? ? current_user.projects.where(content_type: content_type).order(updated_at: :desc).select("uuid", "title", "content_type", "updated_at") : []
  end
end
