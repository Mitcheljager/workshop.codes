Discord::Notifier.setup do |config|
  config.url = ENV["DISCORD_NOTIFICATIONS_WEBHOOK_URL"]
  config.username = "Workshop.codes Notifications"
  config.avatar_url = ""

  # Defaults to `false`
  config.wait = true
end
