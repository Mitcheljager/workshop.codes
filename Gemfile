source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

gem "rails", "~> 6.0.2"
gem "puma", "~> 4.3"
gem "sass-rails", "~> 5.0"
gem "uglifier", ">= 1.3.0"
gem "turbolinks", "~> 5"
gem "jbuilder", "~> 2.5"
gem "inline_svg"
gem "redcarpet"
gem "kaminari"
gem "ahoy_matey"
gem "chart-js-rails"
gem "sendgrid-ruby"
gem "elasticsearch-model", "~> 6"
gem "elasticsearch-rails", "~> 6"
gem "lockbox"
gem "blind_index"
gem "argon2", git: "https://github.com/technion/ruby-argon2.git", submodules: true
gem "bcrypt", :require => "bcrypt"
gem "omniauth-discord"
gem "omniauth-bnet"
gem "high_voltage", "~> 3.0.0"
gem "aws-sdk-s3", require: false
gem "mini_magick", ">= 4.9.5"
gem "image_processing", "~> 1.2"
gem "active_storage_validations"
gem "rails_same_site_cookie"
gem "sucker_punch"
gem "diffy"

group :development, :test do
  gem "byebug", platforms: [:mri, :mingw, :x64_mingw]
  gem "capybara", "~> 2.13"
  gem "selenium-webdriver"
  gem "sqlite3", "1.4.1"
end

group :development do
  gem "win32-security"
  gem "web-console", ">= 3.3.0"
  gem "faker"
  gem "active_record_doctor"
end

group :production do
  gem "autoprefixer-rails"
  gem "heroku-deflater"
  gem "scout_apm"
  gem "pg"
  gem "bugsnag"
end

gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
