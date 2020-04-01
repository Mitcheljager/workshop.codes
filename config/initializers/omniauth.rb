Rails.application.config.middleware.use OmniAuth::Builder do
  provider :discord, ENV["DISCORD_CLIENT_ID"], ENV["DISCORD_CLIENT_SECRET"], { provider_ignores_state: true }
end
