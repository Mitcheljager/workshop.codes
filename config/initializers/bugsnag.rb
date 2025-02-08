return unless Rails.env.production?

Bugsnag.configure do |config|
  config.api_key = ENV["BUGSNAG_API_KEY"]
  config.app_version = ENV["HEROKU_RELEASE_VERSION"]
  config.meta_data_filters += ["ip", "ip_address", "clientIp", "client_ip", "remote_ip", "id", "X-Forwarded-For"]
end
