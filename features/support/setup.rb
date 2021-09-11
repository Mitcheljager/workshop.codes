require 'factory_bot'

# Enable use of factory methods without needing to prefix FactoryBot in step definitions
World(FactoryBot::Syntax::Methods)


Capybara.javascript_driver = :selenium_headless
