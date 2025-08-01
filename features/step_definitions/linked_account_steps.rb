"""Perform actual flow"""
When /I (?:try to )?link my (\S+) account/ do |type|
  visit linked_users_path
  to_link_account = @oauth_accounts[service_to_provider(type)]
  stub_oauth_flow(service_to_provider(type), to_link_account[:username]) do
    click_on "Link #{type} account"
  end
end

When /I (?:try to )?unlink my (\S+) account/ do |type|
  visit linked_users_path
  to_unlink_account = @oauth_accounts[service_to_provider(type)]
  within(find("tr", text: "#{service_to_provider(type)}")) do
    click_on "Remove"
  end
end

Then "I should see {string} in my linked accounts" do |username|
  visit linked_users_path
  within(find("table")) do
    expect(page).to have_content username
  end
end

Then "I should not see {string} in my linked accounts" do |username|
  visit linked_users_path
  if all("table").present?
    within(find("table")) do
      expect(page).not_to have_content username
    end
  end
end

def link_account_type(type, central_account_id)
  user = create(:user, @oauth_accounts[service_to_provider(type)].merge({ linked_id: central_account_id }))
  @oauth_accounts[service_to_provider(type)][:id] = user.id
end
