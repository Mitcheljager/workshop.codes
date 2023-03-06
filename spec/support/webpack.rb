
module WebpackTestBuild
  TS_FILE = Rails.root.join("tmp", "webpack-spec-timestamp")
  class << self
    attr_accessor :already_built
  end

  def self.run_webpack
    puts "running webpack-test"
    unless Webpacker.compile
      raise "Error: webpacker failed to build. Run 'bin/webpack', fix any issues, and try again."
    end
    puts "webpack-test compile complete"
    self.already_built = true
    File.open(TS_FILE, "w") { |f| f.write(Time.now.utc.to_i) }
  end

  def self.run_webpack_if_necessary
    return if self.already_built

    if timestamp_outdated?
      run_webpack
    end
  end

  def self.timestamp_outdated?
    return true if !File.exists?(TS_FILE)

    current = current_bundle_timestamp(TS_FILE)

    return true if !current

    expected = Dir[Rails.root.join("app", "javascript", "**", "*")].map do |f|
      File.mtime(f).utc.to_i
    end.max

    return current < expected
  end

  def self.current_bundle_timestamp(file)
    return File.read(file).to_i
  rescue StandardError
    nil
  end
end

RSpec.configure do |config|
  config.before(:each, :js) do
    WebpackTestBuild.run_webpack_if_necessary
  end
end
