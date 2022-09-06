module Helpers
  module OAuth
    def oauth_username_to_mock_uid(provider, username)
      "#{provider}|#{username}"
    end

    def stub_oauth_flow(provider, username, &block)
      base_mock = {
        uid: oauth_username_to_mock_uid(provider, username),
        provider: provider,
        info: {
          provider == "bnet" ? :battletag : :name => username,
          image: "https://ehe.gg/media/img/logos/Elo-Hell-Logo_I-C-Dark.png"
        }
      }
      # Discord-specific adjustments
      # ! If needed in the future for other services,
      # ! can refactor adjustments into a dedicated method
      if provider == "discord"
        base_mock[:info][:name] = username.split("#").first
        base_mock[:extra] = {
          raw_info: {
            discriminator: username.split("#").last
          }
        }
      end
      OmniAuth.config.mock_auth[provider.to_sym] = OmniAuth::AuthHash.new(base_mock)
      block.call
      OmniAuth.config.mock_auth[provider.to_sym] = nil
    end
  end
end
