Given /a(?: normal)? user named "([\d\p{L}_-]*[#\d]*)"(?: with password "([^"\n]+)")?/ do |username, password|
  password ||= 'password'
  @last_created_user = create(:user, username: username, password: password)
end

Given /an admin named "([\d\p{L}_-]*[#\d]*)"(?: with password "([^"\n]+)")?/ do |username, password|
  password ||= 'password'
  @last_created_user = create(:user, username: username, password: password, level: "admin")
end

Given /the user named "([\d\p{L}_-]*[#\d]*)" is deleted/ do |username|
  User.find_by_username(username).destroy
end

Given /the user named "([\d\p{L}_-]*[#\d]*)" is verified/ do |username|
  user = User.find_by(username: username)
  user.update(nice_url: user.clean_username)
  user.update(verified: true)
end

Then "the user (named ){string} should have a new notification" do |username|
  user = User.find_by(username: username)
  expect(user.notifications.count).to eq(1)
end

Then "the user (named ){string} should have {int} notification(s)" do |username, count|
  user = User.find_by(username: username)
  expect(user.notifications.count).to eq(count.to_i)
end

Then "the user (named ){string} should not have any notifications" do |username|
  user = User.find_by(username: username)
  expect(user.notifications.count).to eq(0)
end
