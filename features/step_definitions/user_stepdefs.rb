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
