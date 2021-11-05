module Helpers
  module Users
    def sign_in_as(user, password="password")
      visit logout_path
      visit login_path

      assert page.has_content? "Login"

      fill_in "username", with: user.username
      fill_in "password", with: password
      click_button "Submit"

      # Verify username shows up at top of page
      within('header .user-block') do
        expect(page).to have_content user.username
      end
    end
  end
end
