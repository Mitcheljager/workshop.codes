Given "a legacy authorization for the post titled {string} and user ID {int}" do |post_title, uid|
  post = Post.find_by(title: post_title)
  expect(post).to be_present

  ArchiveAuthorization.create!(code: post.code, bnet_id: uid.to_s)
end

When 'I click the Authenticate with Battle.net button' do
  stub_oauth_flow("bnet", @oauth_accounts["bnet"][:username]) do
    click_on "Authenticate with Battle.net"
  end
end

When 'I try to {word} the archive post titled {string}' do |action, title|
  post = Post.find_by_title(title)
  expect(post).to be_present

  visit post_path(code: post.code)
  click_on "Archive Actions"

  if page.has_link? "Authenticate with Battle.net"
    stub_oauth_flow("bnet", @oauth_accounts["bnet"][:username]) do
      click_on "Authenticate with Battle.net"
    end
  end

  click_on action.titleize
end

When 'I visit the archive actions page for the post titled {string}' do |title|
  post = Post.find_by_title(title)
  expect(post).to be_present

  visit archive_path(code: post.code)
end
