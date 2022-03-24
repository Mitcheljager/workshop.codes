Given /I (?:am logged|log) in as ([\d\p{L}_-]*[#\d]*)(?: using password "([^"\n]+)")?/ do |username, password|
  password ||= 'password'
  step "I log out"
  visit login_path
  fill_in 'username', with: username
  fill_in 'password', with: password
  click_button 'Submit'
  check_logged_in_as username
  @current_user = User.find_by_username(username)
end

Given /I (?:am logged|(?:try to )?log) in with my (\S+) account/ do |type|
  username = @oauth_accounts[service_to_provider(type)][:username]
  stub_oauth_flow(service_to_provider(type), username) do
    visit logout_path
    @current_user = nil
    visit login_path
    click_on "Login with #{type}"
  end
end

Given /a( linked)? (\S+) account "(\S+)"/ do |is_linked, type, username|
  # ? Handle potential need to include more than one instance of account from specific provider?
  @oauth_accounts ||= {}
  @oauth_accounts[service_to_provider(type)] = {
    username: username,
    uid: oauth_username_to_mock_uid(service_to_provider(type), username),
    provider: service_to_provider(type),
    password: "no_password"
  }
  if is_linked.present?
    link_account_type(type, @last_created_user.id)
  end
end

When /I log ?out/ do
  visit logout_path
  @current_user = nil
end

Then "I should be logged in as {string}" do |username|
  check_logged_in_as(username)
end

def check_logged_in_as(username)
  # Verify username shows up at top of page
  within('header .user-block') do
    expect(page).to have_content username
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
  "#{provider}|#{username}"
end

def stub_oauth_flow(provider, username, &block)
  OmniAuth.config.add_mock(provider.to_sym, {
    uid: oauth_username_to_mock_uid(provider, username),
    provider: provider,
    info: {
      name: username,
      image: "https://ehe.gg/media/img/logos/Elo-Hell-Logo_I-C-Dark.png"
    }
  })
  block.call
  OmniAuth.config.mock_auth[provider.to_sym] = nil
end
