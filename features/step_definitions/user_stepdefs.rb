Given /a normal user named "([\d\p{L}_-]*[#\d]*)"(?: with password "([^"\n]+)")?/ do |username, password|
  password ||= 'password'
  user = create(:user, username: username, password: password)
end

Given /I am logged in as ([\d\p{L}_-]*[#\d]*)(?: using password "([^"\n]+)")?/ do |username, password|
  password ||= 'password'
  step "I log out"
  visit login_path
  fill_in 'username', with: username
  fill_in 'password', with: password
  click_button 'Submit'
  # Verify username shows up at top of page
  within('header .user-block') do
    expect(page).to have_content username
  end
  @current_user = User.find_by_username(username)
end

When /I log ?out/ do
  visit logout_path
  @current_user = nil
end
