# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_09_26_145533) do

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.integer "record_id", null: false
    t.integer "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "activities", force: :cascade do |t|
    t.integer "user_id"
    t.integer "content_type"
    t.text "properties"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_activities_on_user_id"
  end

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

  create_table "collections", force: :cascade do |t|
    t.integer "user_id"
    t.string "title"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "nice_url"
  end

  create_table "comments", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.integer "parent_id"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "email_notifications", force: :cascade do |t|
    t.text "email_ciphertext"
    t.integer "post_id"
    t.integer "content_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_email_notifications_on_post_id"
  end

  create_table "favorites", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_favorites_on_post_id"
    t.index ["user_id", "post_id"], name: "index_favorites_on_user_id_and_post_id"
  end

  create_table "forgot_password_tokens", force: :cascade do |t|
    t.integer "user_id"
    t.string "token"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_forgot_password_tokens_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "user_id"
    t.integer "has_been_read", default: 0
    t.string "content"
    t.string "go_to"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "content_type", default: 0
    t.string "concerns_model", default: "post"
    t.integer "concerns_id", default: 0
    t.index ["concerns_id"], name: "index_notifications_on_concerns_id"
    t.index ["user_id"], name: "index_notifications_on_user_id"
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
    t.text "image_order"
    t.string "nice_url"
    t.boolean "private", default: false
    t.integer "collection_id"
    t.string "carousel_video"
    t.integer "listings_count", default: 0
    t.index ["categories"], name: "index_posts_on_categories"
    t.index ["code"], name: "index_posts_on_code"
    t.index ["favorites_count"], name: "index_posts_on_favorites_count"
    t.index ["heroes"], name: "index_posts_on_heroes"
    t.index ["hotness"], name: "index_posts_on_hotness"
    t.index ["maps"], name: "index_posts_on_maps"
    t.index ["tags"], name: "index_posts_on_tags"
    t.index ["title"], name: "index_posts_on_title"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "remember_tokens", force: :cascade do |t|
    t.integer "user_id"
    t.string "token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_remember_tokens_on_user_id"
  end

  create_table "reports", force: :cascade do |t|
    t.integer "user_id"
    t.string "concerns_model"
    t.integer "concerns_id"
    t.text "content"
    t.string "category"
    t.integer "status", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "revisions", force: :cascade do |t|
    t.integer "post_id"
    t.string "code"
    t.string "version"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "visible", default: true
    t.text "snippet"
    t.index ["post_id"], name: "index_revisions_on_post_id"
  end

  create_table "statistics", force: :cascade do |t|
    t.integer "timeframe"
    t.integer "value"
    t.datetime "on_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "properties", default: "{}"
    t.integer "model_id"
    t.integer "content_type", default: 0
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "email_ciphertext"
    t.string "email_bidx"
    t.string "link"
    t.string "description"
    t.string "featured_posts"
    t.string "uid"
    t.string "provider"
    t.string "provider_profile_image"
    t.boolean "high_contrast", default: false
    t.boolean "large_fonts", default: false
    t.boolean "simple_view", default: false
    t.integer "level", default: 0
    t.boolean "verified", default: false
    t.string "nice_url"
    t.index ["email_bidx"], name: "index_users_on_email_bidx"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "while_you_waits", force: :cascade do |t|
    t.integer "post_id"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_while_you_waits_on_post_id"
  end

  create_table "wiki_answers", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.integer "parent_id"
    t.text "content"
    t.boolean "accepted", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "wiki_articles", force: :cascade do |t|
    t.string "title"
    t.string "subtitle"
    t.text "content"
    t.string "slug"
    t.text "tags"
    t.integer "category_id"
    t.string "group_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "wiki_categories", force: :cascade do |t|
    t.string "title"
    t.string "slug"
    t.string "description"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "is_documentation", default: false
  end

  create_table "wiki_edits", force: :cascade do |t|
    t.integer "user_id"
    t.integer "article_id"
    t.integer "content_type"
    t.text "notes"
    t.boolean "approved"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "wiki_question_favorites", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "wiki_questions", force: :cascade do |t|
    t.integer "user_id"
    t.string "title"
    t.text "content"
    t.integer "favorites_count"
    t.integer "answers_count"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
end
