require 'factory_bot'
require 'cucumber'

# Enable use of factory methods without needing to prefix FactoryBot in step definitions
World(FactoryBot::Syntax::Methods)

# Enable mocking the OmniAuth flow
OmniAuth.config.test_mode = true

Capybara.javascript_driver = :selenium_headless

# Set the global random seed for reproducible test runs
InstallPlugin do |config, registry|
  $seed = ENV['SEED'].present? ? ENV['SEED'].to_i : config.seed
  Kernel.srand $seed
  puts "Setting global random seed to #{ $seed }"
end

# Set the random seed at the beginning of each scenario
# to avoid any potential interference from systems not under test
Before do
  Kernel.srand $seed
end

# Report the seed after run, and decouple RNG to maintain test independence
at_exit do
  Kernel.srand
  puts "Global random seed was #{ $seed }"
end
