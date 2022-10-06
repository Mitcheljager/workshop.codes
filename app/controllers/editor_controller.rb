class EditorController < ApplicationController
  def index
    @actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    @values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))

    render svelte_component: 'Editor', props: { values: @values, actions: @actions }
  end
end
