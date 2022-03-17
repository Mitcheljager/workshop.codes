Given /a(?: normal)? user named "([\d\p{L}_-]*[#\d]*)"(?: with password "([^"\n]+)")?/ do |username, password|
  password ||= 'password'
  user = create(:user, username: username, password: password)
end

Given /an admin named "([\d\p{L}_-]*[#\d]*)"(?: with password "([^"\n]+)")?/ do |username, password|
  password ||= 'password'
  create(:user, username: username, password: password, level: "admin")
end
