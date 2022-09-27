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
