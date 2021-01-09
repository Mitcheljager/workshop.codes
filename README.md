# Workshop.codes

This is the repository for the Overwatch Workshop Website [workshop.codes](https://workshop.codes). Anyone is free to contribute or submit issues or requests regarding the website.

This website uses Ruby on Rails 6.0 and Elasticsearch. It's hosted on Heroku, using Bonsai for Elasticsearch.

The HTML and SCSS are structured according to [BEM](http://getbem.com/naming/).
JS does not follow any direct guidelines. Functions should be concise and limited. Files should be separated by their intent. No frameworks or libraries are used.
Images should be losslessly compressed. SVG and WebP should be used wherever possible.

## Setup

_Please note; This isn't a comprehensive guide on how to install Ruby on Rails. If you're new to this platform, do your own Googling._

1. Install Ruby (use a version manager to make things easier [http://rvm.io/](http://rvm.io/) or just install it directly from [https://rubyinstaller.org/downloads/](https://rubyinstaller.org/downloads/) using version 2.7.2)
2. Install Rails
3. Install NPM/Yarn [https://yarnpkg.com/](https://yarnpkg.com/)
4. `bundle install` to install dependencies
5. `yarn install` to install javascript dependencies
6. `rake db:create db:migrate` to set up the database
7. `rake db:seed` to seed the database
8. `rails s` to start the server
9. Everything should now be running at `localhost:3000`

Optionally you can also install ElasticSearch, but the website will run fine without it (Except for search).
To create indexes for ElasticSearch run `rake create_search_indexes`

## Environment vars

Create `config/local_env.yml`
There's several Environment vars that are required for some parts of the website. All of these are optional. These are:

- `SENDGRID_USERNAME` - Your Sendgrid Username for sending emails
- `SENDGRID_PASSWORD` - Your Sendgrid Password for sending emails
- `LOCKBOX_MASTER_KEY` - Lockbox Master key to encrypt email addresses (Run `Lockbox.generate_key` to generate a key)
- `BLIND_INDEX_MASTER_KEY` - Lockbox Blind index master key to search encrypted database fields (use `ffffffffffffffffffffffffffffffff` during testing)- 
- `BNET_KEY` - Battle.net key for OAuth
- `BNET_SECRET` - Battle.net secret for OAuth
- `DIGITALOCEAN_SPACES_KEY` - DigitalOcean Spaces Key for image upload
- `DIGITALOCEAN_SPACES_SECRET` - DigitalOcean Spaces Secret for image upload
- `DIGITALOCEAN_SPACES_REGION` - DigitalOcean Spaces Region for image upload
- `DIGITALOCEAN_SPACES_BUCKET` - DigitalOcean Spaces Bucket for image upload
- `DIGITALOCEAN_SPACES_ENDPOINT` - DigitalOcean Spaces Endpoint for image upload
- `DISCORD_CLIENT_ID` - Discord Client ID for OAuth
- `DISCORD_CLIENT_SECRET` - Discord Client Secret for OAuth
- `DISCORD_REQUEST_URI` - Discord Request URI for OAuth
- `DISCORD_NOTIFICATIONS_WEBHOOK_URL` - Discord webhook URL for new/updating Posts
- `DISCORD_REPORTS_WEBHOOK_URL` - Discord webhook URL for submitting Reports
- `DISCORD_BUGSNAG_WEBHOOK_URL` - Discord webhook for Bugsnag errors
- `BONSAI_URL` - Used for ElasticSearch. When running ElasticSearch on your dev environment this can be any random string and it will assume you have ElasticSearch running.

## Rake tasks

There are several rake tasks you can use to make development a little closer to production.

- `rake compress_impressions` generates user and post analytics. Click around the website before hand to generate impressions and events.
- `rake hotness:set_hotness_for_posts` sets the `hotness` or "On Fire" score for posts. This is based on impressions, events and favorites. To get useful data out of this, use the website at random before running this task.
- `rake generate_wiki_articles` to populate the Wiki with Workshop documentation\
- `rake create_search_indexes` to create indexes for ElasticSearch
