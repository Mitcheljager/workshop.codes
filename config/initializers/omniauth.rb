Rails.application.config.middleware.use OmniAuth::Builder do
  provider :discord, ENV["DISCORD_CLIENT_ID"], ENV["DISCORD_CLIENT_SECRET"], { provider_ignores_state: true }
  provider :bnet, ENV["BNET_KEY"], ENV["BNET_SECRET"], scope: "openid"
end
