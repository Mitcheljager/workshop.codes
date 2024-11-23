Given "{string} has a source {string}" do |post_title, source_title|
  post = Post.find_by_title(post_title)
  source = Post.find_by_title(source_title)
  expect(post).to be_present
  expect(source).to be_present

  derivative = Derivative.create(derivation: post, source: source, source_code: source.code)
  expect(derivative).to be_persisted
end

When "I (try to )add the post titled {string} as a source" do |title|
  # HACK: This is not a robust check for whether we are actually editing a post (as opposed to another model)
  fail "Need to be on a post edit page" unless page.current_path.ends_with?("/edit")

  post = Post.find_by_title(title)
  expect(post).to be_present

  check id: "show_derivative", allow_label_click: true

  fill_in "CODE1, CODE2, etc.", with: post.code
  find("ul.form-tags-autocomplete-results").find("li.tag-item:nth-of-type(1)").click

  click_on "Save"
end

When "I try to remove the post titled {string} as a source" do |title|
  # HACK: This is not a robust check for whether we are actually editing a post (as opposed to another model)
  fail "Need to be on a post edit page" unless page.current_path.ends_with?("/edit")
  post = Post.find_by_title(title)
  expect(post).to be_present

  within "[data-svelte-component='DerivativesForm']" do
    close = find("span", text: post.code).find("button")
    close.click
  end

  click_on "Save"
end

Then "I should see {string} as a source for {string}" do |source, post_title|
  post = Post.find_by_title(post_title)
  expect(post).to be_present

  visit post_path(code: post.code)
  within ".derivatives" do
    expect(page).to have_content(source)
  end
end

Then "I should not see {string} as a source for {string}" do |source, post_title|
  post = Post.find_by_title(post_title)
  expect(post).to be_present

  visit post_path(code: post.code)

  # The section is not present if there are no sources
  next unless post.sources.present?
  within ".derivatives" do
    expect(page).not_to have_content(source)
  end
end

Then "I should see {string} as a derivative of {string}" do |derivative, post_title|
  post = Post.find_by_title(post_title)
  expect(post).to be_present

  visit post_path(code: post.code)

  click_on "Derivations"
  within "div[data-tab='derivations']" do
    expect(page).to have_content(derivative)
  end
end

Then "I should not see {string} as a derivative of {string}" do |derivative, post_title|
  post = Post.find_by_title(post_title)
  expect(post).to be_present

  visit post_path(code: post.code)

  # The tab is not visible unless there are derivations
  next unless post.derivations.public?.present?
  click_on "Derivations"
  within "div[data-tab='derivations']" do
    expect(page).not_to have_content(derivative)
  end
end
