# rubocop:disable Lint/Debugger
class CucumberCounters
  @error_counter = 0
  @step_counter = 0
  @screenshot_counter = 0
  class << self
    attr_accessor :error_counter, :step_counter, :screenshot_counter
  end
end

# `cucumber LAUNCHY=1` to open save screenshot after every step
After do |scenario|
  next unless (ENV['LAUNCHY'] || ENV['CI']) && scenario.failed?
  puts "Opening snapshot for #{scenario.name}"
  begin
    save_and_open_screenshot
  rescue StandardError
    puts "Can't save screenshot"
  end
  begin
    save_and_open_page
  rescue StandardError
    puts "Can't save page"
  end
end

# `cucumber DEBUGGER=1` to drop into debugger on failure
Cucumber::Core::Test::Action.class_eval do
  ## first make sure we don't lose original accept method
  unless instance_methods.include?(:orig_failed)
    alias_method :orig_failed, :failed
  end

  ## wrap original accept method to catch errors in executed step
  def failed(*args)
    begin
      CucumberCounters.error_counter += 1
      file_name = format('tmp/capybara/error_%03d.png',
                         CucumberCounters.error_counter)
      Capybara.page.save_screenshot(file_name, full: true)
      Rails.logger.info("[Cucumber] Saved screenshot of error for #{ @scenario_name } to #{ file_name }")
    rescue
      Rails.logger.info('[Cucumber] Cannot make screenshot of failure')
    end
    binding.pry if ENV['DEBUGGER']
    orig_failed(*args)
  end
end

# Store the current scenario name as an instance variable, to make it
# available to the other hooks.
Before do |scenario|
  @scenario_name = scenario.name
  Rails.logger.info("[Cucumber] starting the #{@scenario_name}")
end

# Reset counters

# `cucumber STEP=1` to pause after each step
AfterStep do |scenario|
  next unless ENV['STEP']
  unless defined?(@counter)
    puts "Stepping through #{@scenario_name}"
    @counter = 0
  end
  @counter += 1
  print "After step ##{@counter}/#{scenario.send(:steps).try(:count)}: "\
        "#{scenario.send(:steps).to_a[@counter].try(:name) ||
        '[RETURN to continue]'}..."
  STDIN.getc
end

# `cucumber PHOTO_MODE=1` to save a screenshot after each step
AfterStep do |scenario|
  next unless ENV['PHOTO_MODE']
  CucumberCounters.step_counter += 1
  step = CucumberCounters.step_counter
  file_name = format('%s/step_%03d.png', @scenario_name.downcase.gsub(" ", "_"), step)
  Rails.logger.info("[Cucumber] after step: #{@scenario_name}, step: #{step}")
  begin
    Capybara.page.save_screenshot(file_name, full: true)
    Rails.logger.info("[Cucumber] Screenshot #{step} saved")
  rescue
    Rails.logger.info("[Cucumber] Cannot make screenshot of #{step}")
  end
end
