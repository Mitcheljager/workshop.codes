source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

gem "rails", "~> 5.2.3"
gem "pg"
gem "puma", "~> 3.7"
gem "sass-rails", "~> 5.0"
gem "uglifier", ">= 1.3.0"
gem "turbolinks", "~> 5"
gem "jbuilder", "~> 2.5"
gem "inline_svg"
gem "redcarpet"

gem "bcrypt", :require => "bcrypt"
gem "high_voltage", "~> 3.0.0"

gem "elasticsearch-model"
gem "elasticsearch-rails"

group :development, :test do
  gem "byebug", platforms: [:mri, :mingw, :x64_mingw]
  gem "capybara", "~> 2.13"
  gem "selenium-webdriver"
  gem "sqlite3", "1.3.13"
end

group :development do
  gem "win32-security"
  gem "web-console", ">= 3.3.0"
end

group :production do
  gem "autoprefixer-rails"
  gem "heroku-deflater"
end

gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
