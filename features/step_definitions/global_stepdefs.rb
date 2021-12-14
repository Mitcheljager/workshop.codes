Then "I should see {string}" do |string|
  expect(page).to have_content(string)
end

Then "I should see a notification saying {string}" do |string|
  page.find(".alerts__alert", text: string)
end
