Given /a post by ([\d\p{L}_-]*[#\d]*) titled "([^"]+)"/ do |username, title|
  user = User.find_by_username(username)
  expect(user).to be_present
  create(:post, user: user, title: title)
end

When 'I create a post titled {string}' do |title|
  fail 'Must log in as a user first' unless @current_user
  create(:post, user: @current_user, title: title)
end
