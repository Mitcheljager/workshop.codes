# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_10_25_134731) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "record_type", limit: 255, null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", limit: 255, null: false
    t.string "filename", limit: 255, null: false
    t.string "content_type", limit: 255
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.string "service_name", limit: 255, null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", limit: 255, null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "activities", force: :cascade do |t|
    t.integer "user_id"
    t.integer "content_type"
    t.text "properties"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["user_id"], name: "index_activities_on_user_id"
  end

  create_table "ahoy_events", force: :cascade do |t|
    t.bigint "visit_id"
    t.bigint "user_id"
    t.string "name", limit: 255
    t.text "properties"
    t.datetime "time", precision: nil
    t.integer "model_id"
    t.index ["model_id"], name: "index_ahoy_events_on_model_id"
    t.index ["name", "time"], name: "index_ahoy_events_on_name_and_time"
    t.index ["user_id"], name: "index_ahoy_events_on_user_id"
    t.index ["visit_id"], name: "index_ahoy_events_on_visit_id"
  end

  create_table "ahoy_visits", force: :cascade do |t|
    t.string "visit_token", limit: 255
    t.string "visitor_token", limit: 255
    t.bigint "user_id"
    t.string "ip", limit: 255
    t.text "user_agent"
    t.text "referrer"
    t.string "referring_domain", limit: 255
    t.text "landing_page"
    t.string "browser", limit: 255
    t.string "os", limit: 255
    t.string "device_type", limit: 255
    t.string "country", limit: 255
    t.string "region", limit: 255
    t.string "city", limit: 255
    t.float "latitude"
    t.float "longitude"
    t.string "utm_source", limit: 255
    t.string "utm_medium", limit: 255
    t.string "utm_term", limit: 255
    t.string "utm_content", limit: 255
    t.string "utm_campaign", limit: 255
    t.string "app_version", limit: 255
    t.string "os_version", limit: 255
    t.string "platform", limit: 255
    t.datetime "started_at", precision: nil
    t.index ["user_id"], name: "index_ahoy_visits_on_user_id"
    t.index ["visit_token"], name: "index_ahoy_visits_on_visit_token", unique: true
    t.index ["visitor_token", "started_at"], name: "index_ahoy_visits_on_visitor_token_and_started_at"
  end

  create_table "archive_authorizations", force: :cascade do |t|
    t.string "code", limit: 255, null: false
    t.string "bnet_id", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["code"], name: "index_archive_authorizations_on_code", unique: true
  end

  create_table "articles", force: :cascade do |t|
    t.string "title", limit: 255
    t.string "slug", limit: 255
    t.text "content"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "badges", force: :cascade do |t|
    t.integer "badge_id"
    t.integer "user_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "blocks", force: :cascade do |t|
    t.integer "content_type", default: 0
    t.integer "content_id"
    t.integer "user_id"
    t.string "name", limit: 255
    t.text "properties"
    t.integer "position"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "collections", force: :cascade do |t|
    t.integer "user_id"
    t.string "title", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "nice_url", limit: 255
    t.text "description"
    t.integer "display_type", default: 0
    t.integer "posts_count"
  end

  create_table "comments", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.integer "parent_id"
    t.text "content"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "derivatives", force: :cascade do |t|
    t.integer "source_id"
    t.integer "derivation_id"
    t.string "source_code", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["source_code", "derivation_id"], name: "index_derivatives_on_source_code_and_derivation_id", unique: true
  end

  create_table "disco_recommendations", force: :cascade do |t|
    t.string "subject_type", limit: 255
    t.bigint "subject_id"
    t.string "item_type", limit: 255
    t.bigint "item_id"
    t.string "context", limit: 255
    t.float "score"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["item_type", "item_id"], name: "index_disco_recommendations_on_item"
    t.index ["subject_type", "subject_id"], name: "index_disco_recommendations_on_subject"
  end

  create_table "email_notifications", force: :cascade do |t|
    t.text "email_ciphertext"
    t.integer "post_id"
    t.integer "content_type"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["post_id"], name: "index_email_notifications_on_post_id"
  end

  create_table "favorites", force: :cascade do |t|
    t.integer "user_id"
    t.integer "post_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["post_id"], name: "index_favorites_on_post_id"
    t.index ["user_id", "post_id"], name: "index_favorites_on_user_id_and_post_id"
  end

  create_table "forgot_password_tokens", force: :cascade do |t|
    t.integer "user_id"
    t.string "token", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["user_id"], name: "index_forgot_password_tokens_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "user_id"
    t.integer "has_been_read", default: 0
    t.string "content", limit: 255
    t.string "go_to", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "content_type", default: 0
    t.string "concerns_model", limit: 255, default: "post"
    t.integer "concerns_id", default: 0
    t.index ["concerns_id"], name: "index_notifications_on_concerns_id"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "posts", force: :cascade do |t|
    t.integer "user_id"
    t.string "code", limit: 255
    t.string "title", limit: 255
    t.text "description"
    t.string "categories", limit: 255
    t.string "tags", limit: 255
    t.string "heroes", limit: 255
    t.string "maps", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "version", limit: 255
    t.integer "favorites_count", default: 0
    t.integer "impressions_count", default: 0
    t.integer "hotness", default: 1
    t.text "snippet"
    t.text "image_order"
    t.string "nice_url", limit: 255
    t.boolean "private", default: false
    t.integer "collection_id"
    t.string "carousel_video", limit: 255
    t.integer "listings_count", default: 0
    t.boolean "unlisted", default: false
    t.string "locale", limit: 255, default: "en"
    t.boolean "ptr", default: false
    t.datetime "last_revision_created_at", precision: nil
    t.boolean "immortal", default: false
    t.boolean "draft", default: false
    t.text "controls", default: "[]"
    t.integer "min_players"
    t.integer "max_players"
    t.integer "comments_count", default: 0
    t.boolean "overwatch_2_compatible", default: false
    t.integer "top_hotness", default: 1
    t.datetime "top_hotness_at", precision: nil
    t.boolean "light_header", default: false
    t.string "project_uuid", limit: 255
    t.datetime "hotness_last_updated_at"
    t.integer "copies_count", default: 0
    t.index ["categories"], name: "index_posts_on_categories"
    t.index ["code"], name: "index_posts_on_code"
    t.index ["favorites_count"], name: "index_posts_on_favorites_count"
    t.index ["heroes"], name: "index_posts_on_heroes"
    t.index ["hotness"], name: "index_posts_on_hotness"
    t.index ["maps"], name: "index_posts_on_maps"
    t.index ["project_uuid"], name: "index_posts_on_project_uuid"
    t.index ["tags"], name: "index_posts_on_tags"
    t.index ["title"], name: "index_posts_on_title"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "project_backups", force: :cascade do |t|
    t.string "uuid", limit: 255
    t.string "project_uuid", limit: 255
    t.string "title", limit: 255
    t.text "content"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["project_uuid"], name: "index_project_backups_on_project_uuid"
    t.index ["uuid"], name: "index_project_backups_on_uuid"
  end

  create_table "projects", force: :cascade do |t|
    t.integer "user_id"
    t.string "title", limit: 255
    t.text "content"
    t.string "uuid", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "content_type", default: 0
  end

  create_table "remember_tokens", force: :cascade do |t|
    t.integer "user_id"
    t.string "token", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["user_id"], name: "index_remember_tokens_on_user_id"
  end

  create_table "reports", force: :cascade do |t|
    t.integer "user_id"
    t.string "concerns_model", limit: 255
    t.integer "concerns_id"
    t.text "content"
    t.string "category", limit: 255
    t.integer "status", default: 0
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "visit_token", limit: 255
    t.text "properties", default: "[]"
    t.integer "reported_user_id"
  end

  create_table "revisions", force: :cascade do |t|
    t.integer "post_id"
    t.string "code", limit: 255
    t.string "version", limit: 255
    t.text "description"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "visible", default: true
    t.text "snippet"
    t.index ["post_id"], name: "index_revisions_on_post_id"
  end

  create_table "statistics", force: :cascade do |t|
    t.integer "timeframe"
    t.integer "value"
    t.datetime "on_date", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.text "properties", default: "{}"
    t.integer "model_id"
    t.integer "content_type", default: 0
    t.index ["content_type"], name: "index_statistics_on_content_type"
    t.index ["model_id"], name: "index_statistics_on_model_id"
    t.index ["on_date"], name: "index_statistics_on_on_date"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", limit: 255
    t.string "password_digest", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.text "email_ciphertext"
    t.string "email_bidx", limit: 255
    t.string "link", limit: 255
    t.string "description", limit: 255
    t.string "featured_posts", limit: 255
    t.string "uid", limit: 255
    t.string "provider", limit: 255
    t.string "provider_profile_image", limit: 255
    t.boolean "high_contrast", default: false
    t.boolean "large_fonts", default: false
    t.integer "level", default: 0
    t.boolean "verified", default: false
    t.string "nice_url", limit: 255
    t.text "custom_css"
    t.integer "pagination_type", default: 0
    t.integer "linked_id"
    t.string "uuid", limit: 36
    t.datetime "feed_last_visited_at", precision: nil
    t.boolean "send_email_on_notification", default: false
    t.integer "favorites_count", default: 0
    t.index ["email_bidx"], name: "index_users_on_email_bidx"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "webhook_values", force: :cascade do |t|
    t.string "name", limit: 255
    t.string "value", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "wiki_articles", force: :cascade do |t|
    t.string "title", limit: 255
    t.string "subtitle", limit: 255
    t.text "content"
    t.string "slug", limit: 255
    t.text "tags"
    t.integer "category_id"
    t.string "group_id", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "wiki_categories", force: :cascade do |t|
    t.string "title", limit: 255
    t.string "slug", limit: 255
    t.string "description", limit: 255
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "is_documentation", default: false
  end

  create_table "wiki_edits", force: :cascade do |t|
    t.integer "user_id"
    t.integer "article_id"
    t.integer "content_type"
    t.text "notes"
    t.boolean "approved"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "posts", "users"
end
