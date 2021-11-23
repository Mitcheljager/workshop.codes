return unless Rails.env.production?

Bugsnag.configure do |config|
  config.api_key = ENV["BUGSNAG_API_KEY"]
  config.app_version = ENV["HEROKU_RELEASE_VERSION"]
end
