source 'https://rubygems.org'
ruby "~> 3.2.2"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

gem "active_model_serializers"
gem "active_storage_validations"
gem "ahoy_matey"
gem "argon2", git: "https://github.com/technion/ruby-argon2.git", submodules: true
gem "aws-sdk-s3", require: false
gem "bcrypt", require: "bcrypt"
gem "blind_index"
gem "breadcrumbs_on_rails"
gem 'bonsai-elasticsearch-rails', github: 'omc/bonsai-elasticsearch-rails', branch: 'master'
gem "bootsnap", require: false
gem "chart-js-rails"
gem "concurrent-ruby", "= 1.3.4"
gem "diffy"
gem "disco"
gem "discord-notifier"
gem "dynoscale_ruby"
gem "elasticsearch-model", "7.1.1"
gem "elasticsearch-rails", "7.1.1"
gem "elasticsearch", "<= 7.10.2" # Limited by Bonsai support
gem "elasticsearch-api", "<= 7.10.2" # Limited by Bonsai support
gem "geocoder"
gem "image_processing", "~> 1.12"
gem "inline_svg"
gem "jbuilder", "~> 2.5"
gem "kaminari"
gem "lockbox"
gem "maxminddb"
gem "mini_magick", ">= 4.9.5"
gem "omniauth-bnet"
gem "omniauth-discord"
# Mitigate CVE-2015-9284
gem "omniauth-rails_csrf_protection"
gem "puma", "~> 5.6"
gem "rails", "~> 7.0.5"
gem "rails_same_site_cookie"
gem "redcarpet"
gem "render_async"
gem "reverse_markdown"
gem "ruby-openai", "~> 5.0"
gem "sanitize", "6.1.3"
gem "sass-rails", "~> 5.0"
gem "sendgrid-ruby"
gem "sprockets-rails"
gem "sucker_punch"
gem "turbolinks", "~> 5"
gem "tzinfo-data"
gem "uglifier", ">= 1.3.0"
gem "vite_rails"

group :development, :test do
  gem "bullet"
  gem "byebug", platforms: [:mri, :mingw, :x64_mingw]
  gem "capybara", "3.38.0"
  gem "cucumber-rails", require: false
  gem "database_cleaner"
  gem "factory_bot_rails", "~> 6.2"
  gem "faker"
  gem "pry-byebug", "~> 3.10.1"
  gem "rspec-rails", "~> 4.0.2"
  gem "selenium-webdriver", "~> 4.7.1"
  gem "shoulda-matchers", "~> 4.5"
  gem "sqlite3", "1.4.2"
  # To freeze time and allow time travel for time-sensitive tests
  gem "timecop"
  gem "webdrivers", "~> 5.0"
end

group :development do
  gem "active_record_doctor"
  gem "web-console", ">= 3.3.0"
  gem "win32-security", platforms: [:mingw, :x64_mingw, :mswin]
  gem "derailed_benchmarks", group: :development
  gem "sys-proctable"
end

group :production do
  gem "autoprefixer-rails"
  gem "bugsnag"
  # gem "heroku-deflater"
  gem "pg"
  gem "scout_apm"
end
