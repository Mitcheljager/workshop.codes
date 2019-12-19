# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_12_19_145617) do

  create_table "ahoy_events", force: :cascade do |t|
    t.integer "visit_id"
    t.integer "user_id"
    t.string "name"
    t.text "properties"
    t.datetime "time"
    t.index ["name", "time"], name: "index_ahoy_events_on_name_and_time"
    t.index ["user_id"], name: "index_ahoy_events_on_user_id"
    t.index ["visit_id"], name: "index_ahoy_events_on_visit_id"
  end

  create_table "ahoy_visits", force: :cascade do |t|
    t.string "visit_token"
    t.string "visitor_token"
    t.integer "user_id"
    t.string "ip"
    t.text "user_agent"
    t.text "referrer"
    t.string "referring_domain"
    t.text "landing_page"
    t.string "browser"
    t.string "os"
    t.string "device_type"
    t.string "country"
    t.string "region"
    t.string "city"
    t.float "latitude"
    t.float "longitude"
    t.string "utm_source"
    t.string "utm_medium"
    t.string "utm_term"
    t.string "utm_content"
    t.string "utm_campaign"
    t.string "app_version"
    t.string "os_version"
    t.string "platform"
    t.datetime "started_at"
    t.index ["user_id"], name: "index_ahoy_visits_on_user_id"
    t.index ["visit_token"], name: "index_ahoy_visits_on_visit_token", unique: true
  end

  create_table "comments", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.integer "parent_id"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "favorites", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "post_id"], name: "index_favorites_on_user_id_and_post_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "user_id"
    t.integer "has_been_read", default: 0
    t.string "content"
    t.string "go_to"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "posts", force: :cascade do |t|
    t.integer "user_id"
    t.string "code"
    t.string "title"
    t.text "description"
    t.string "categories"
    t.string "tags"
    t.string "heroes"
    t.string "maps"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "version"
    t.integer "favorites_count", default: 0
    t.integer "impressions_count", default: 0
    t.integer "hotness"
    t.text "snippet"
    t.index ["categories"], name: "index_posts_on_categories"
    t.index ["code"], name: "index_posts_on_code"
    t.index ["favorites_count"], name: "index_posts_on_favorites_count"
    t.index ["heroes"], name: "index_posts_on_heroes"
    t.index ["hotness"], name: "index_posts_on_hotness"
    t.index ["maps"], name: "index_posts_on_maps"
    t.index ["tags"], name: "index_posts_on_tags"
    t.index ["title"], name: "index_posts_on_title"
  end

  create_table "remember_tokens", force: :cascade do |t|
    t.integer "user_id"
    t.string "token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "revisions", force: :cascade do |t|
    t.integer "post_id"
    t.string "code"
    t.string "version"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "snippets", force: :cascade do |t|
    t.integer "user_id"
    t.string "unique_id"
    t.string "title"
    t.text "content"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "proficiency", default: 0
    t.integer "impressions_count", default: 0
    t.boolean "private", default: false
    t.index ["title"], name: "index_snippets_on_title"
    t.index ["unique_id"], name: "index_snippets_on_unique_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "while_you_waits", force: :cascade do |t|
    t.integer "post_id"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
