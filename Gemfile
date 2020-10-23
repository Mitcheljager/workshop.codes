source 'https://rubygems.org'
ruby "~> 2.6"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

gem "active_model_serializers"
gem "active_storage_validations"
gem "ahoy_matey"
gem "argon2", git: "https://github.com/technion/ruby-argon2.git", submodules: true
gem "aws-sdk-s3", require: false
gem "bcrypt", :require => "bcrypt"
gem "blind_index"
gem "breadcrumbs_on_rails"
gem "chart-js-rails"
gem "diffy"
gem "discord-notifier"
gem "elasticsearch-model", "~> 6"
gem "elasticsearch-rails", "~> 6"
gem "high_voltage", "~> 3.0.0"
gem "httparty"
gem "image_processing", "~> 1.2"
gem "inline_svg"
gem "jbuilder", "~> 2.5"
gem "kaminari"
gem "lockbox"
gem "maxminddb"
gem "mini_magick", ">= 4.9.5"
gem "omniauth-bnet"
gem "omniauth-discord"
gem "puma", "~> 4.3"
gem "rails", "~> 6.0.2"
gem "rails-i18n"
gem "rails_same_site_cookie"
gem "redcarpet"
gem "render_async"
gem "reverse_markdown"
gem "sass-rails", "~> 5.0"
gem "sendgrid-ruby"
gem "sucker_punch"
gem "turbolinks", "~> 5"
gem "uglifier", ">= 1.3.0"

group :development, :test do
  gem "byebug", platforms: [:mri, :mingw, :x64_mingw]
  gem "capybara", "~> 2.13"
  gem "selenium-webdriver"
  gem "sqlite3", "1.4.1"
end

group :development do
  gem "active_record_doctor"
  gem "faker"
  gem "web-console", ">= 3.3.0"
  gem "win32-security"
end

group :production do
  gem "autoprefixer-rails"
  gem "bugsnag"
  gem "heroku-deflater"
  gem "pg"
  gem "scout_apm"
end

gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
