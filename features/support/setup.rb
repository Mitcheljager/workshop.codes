require 'factory_bot'
require 'cucumber'

# Enable use of factory methods without needing to prefix FactoryBot in step definitions
World(FactoryBot::Syntax::Methods)


Capybara.javascript_driver = :selenium_headless

# Set the global random seed for reproducible test runs
AfterConfiguration do |config|
  $seed = ENV['SEED'].present? ? ENV['SEED'].to_i : config.seed
  Kernel.srand $seed
  puts "Setting global random seed to #{ $seed }"
end

# Report the seed after run
at_exit do
  puts "Global random seed was #{ $seed }"
end
