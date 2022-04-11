Given /an? ?([a-z]+)? post by ([\d\p{L}_-]*[#\d]*) titled "([^"]+)"/ do |visibility, username, title|
  visibility ||= "public"
  user = User.find_by_username(username)
  expect(user).to be_present
  post = create(:post, user: user, title: title)
  update_post_visibility(post, visibility)
end

Given "the following posts exist" do |table|
  table.hashes.each do |hash|
    user = User.find_by_username(hash[:user])
    expect(user).to be_present
    post = create(:post, user: user, title: hash[:title])

    update_post_visibility(post, hash[:visibility])
  end
end

Given "the post titled {string} is (a ){word}" do |title, visibility|
  post = Post.find_by(title: title)
  expect(post).to be_present
  unless visibility.downcase == "draft"
    visit edit_post_path(code: post.code)
    click_on "Settings"
    choose visibility.titleize
    click_on "Save"
  else # Need to manually override the visibility status
    post.draft = true
    post.save
  end
end

When 'I try to {word} a/the post titled {string}' do |action, title|
  case action

  when 'create'
    visit new_post_path
    fill_in_post_form
    fill_in "post_title", with: title
    click_on 'Save'

  when 'edit'
    post = Post.find_by_title(title)
    expect(post).to be_present
    visit edit_post_path(code: post.code)

  when 'delete'
    post = Post.find_by_title(title)
    expect(post).to be_present
    visit post_path(code: post.code)
    accept_confirm do
      click_on 'Delete'
    end

  when 'report'
    post = Post.find_by_title(title)
    expect(post).to be_present
    visit post_path(code: post.code)
    click_on 'Report code'
    fill_in_report_form
    click_on 'Submit'
    find('[data-role="report-alert"]') # Force Capybara to wait until report alert appears
  else
    fail "Don't know how to perform #{ action } on posts"
  end
end

Then "I should be able to edit the post's {word} to {string}" do |attr, value|
  fill_in "post_#{ attr.downcase }", with: value
  click_on 'Save'
end

Then "I should be on the page for the post titled {string}" do |title|
  post = Post.find_by_title(title)
  expect(post).to be_present
  expect(page.current_path).to eq(post_path(code: post.code))
end

Then /there should (not)? be a post titled "([^"]+)"/ do |negate, title|
  expect(Post.find_by_title(title).present?).not_to eq(negate.present?)
end

def fill_in_post_form
  post_attrs = attributes_for(:post)

  # Header
  fill_in "post_title", with: post_attrs[:title]
  fill_in "post_code", with: post_attrs[:code]

  # Settings
  click_on "Settings"
  post_attrs[:categories].each do |category|
    select(category, from: "post_categories")
  end
  # Simulating actualy clicking/pressing/dragging is a pain with Capybara
  slider = page.evaluate_script "slider=document.querySelector('[data-role=\"num-player-slider\"][data-type=\"post\"]');"
  page.execute_script "const slider = arguments[0]; slider.noUiSlider.set([#{ post_attrs[:min_players] }, #{ post_attrs[:max_players] }]);", slider

  # Heroes
  click_on "Heroes"
  post_attrs[:heroes].each do |hero|
    check(hero)
  end

  # Maps
  click_on "Maps"
  post_attrs[:maps].each do |map|
    check(map)
  end

  # Return to default tab
  click_on "Description"
end

def update_post_visibility(post, visibility)
  case visibility
  when "public"
    post.update(draft: false, private: false, unlisted: false)
  when "private"
    post.update(private: true)
  when "unlisted"
    post.update(unlisted: true)
  when "draft"
    post.update(draft: true)
  end
end
