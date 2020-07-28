Discord::Notifier.setup do |config|
  config.url = ENV["DISCORD_NOTIFICATIONS_WEBHOOK_URL"]
  config.username = "Workshop.codes Notifications"
  config.avatar_url = "https://cdn.discordapp.com/app-icons/695034676880080956/958269ce0daaf15759362b629d14fd55.png"

  # Defaults to `false`
  config.wait = true
end
