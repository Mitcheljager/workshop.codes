# This really should be a Given and a When with different checks.
# Unfortunately, I do not care enough to separate them.
Given /I (?:am logged|(?:try to )?log) in with my (\S+) account/ do |type|
  account = @oauth_accounts[service_to_provider(type)]
  username = account[:username]
  stub_oauth_flow(service_to_provider(type), username) do
    visit logout_path
    @current_user = nil
    visit login_path
    click_on "Login with #{type}"
  end
  @current_user = User.find_by(provider: account[:provider], uid: account[:uid])
  expect(@current_user).to be_present
end

Given /a( linked)? (\S+) account "(\S+)"(?: with ID (\d+))?/ do |is_linked, type, username, uid|
  # ? Handle potential need to include more than one instance of account from specific provider?
  @oauth_accounts ||= {}
  @oauth_accounts[service_to_provider(type)] = {
    username:,
    uid: uid.present? ? uid.to_s : oauth_username_to_mock_uid(service_to_provider(type), username),
    provider: service_to_provider(type),
    password: "no_password"
  }
  if is_linked.present?
    link_account_type(type, @last_created_user.id)
  end
end

def service_to_provider(service)
  case service.downcase
  when "battle.net"
    "bnet"
  when "discord"
    "discord"
  else
    nil
  end
end

def oauth_username_to_mock_uid(provider, username)
  @oauth_accounts.key?(provider) ? @oauth_accounts[provider][:uid] : "#{provider}|#{username}"
end

def stub_oauth_flow(provider, username, &block)
  base_mock = {
    uid: oauth_username_to_mock_uid(provider, username),
    provider:,
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
