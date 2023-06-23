require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module OverwatchWorkshop
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0
    config.active_storage.replace_on_assign_to_many = false
    config.exceptions_app = self.routes
    config.active_job.queue_adapter = :sucker_punch
    config.active_storage.track_variants = true
    config.middleware.insert_after ActionDispatch::Static, Rack::Deflater

    config.i18n.available_locales = [:en, :ko]
    config.i18n.default_locale = :en
    config.i18n.fallbacks = true
    config.i18n.fallbacks = [:en]

    config.active_support.cache_format_version = 7.0
    config.active_support.disable_to_s_conversion = true

    config.before_configuration do
      env_file = File.join(Rails.root, "config", "local_env.yml")

      YAML.load(File.open(env_file)).each do |key, value|
        ENV[key.to_s] = value
      end if File.exist?(env_file)
    end

    # https://discuss.rubyonrails.org/t/cve-2022-32224-possible-rce-escalation-bug-with-serialized-columns-in-active-record/81017
    # https://github.com/EloHellEsports/workshop.codes/issues/169
    config.active_record.yaml_column_permitted_classes = [Symbol, Date, Time, ActionController::Parameters, ActiveSupport::HashWithIndifferentAccess]

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
  end
end
