class FilterContraints
  def self.matches?(request)
    request.path_parameters.without(:controller, :action, :page).length > 0
  end
end

class KoConstraint
  def matches?(request)
    request.path.starts_with?('/ko')
  end
end

Rails.application.routes.draw do
  concern :paginatable do
    get "(page/:page)", action: :index, on: :collection, as: ""
  end

  constraints(KoConstraint.new) do
    get "*path", to: redirect { |params, request| request.path.sub("/ko", "") }, format: false
  end

  root "posts#index"

  get "/404", to: "errors#not_found"
  get "/422", to: "errors#unacceptable"
  get "/500", to: "errors#internal_error"

  get "sitemap", to: "sitemaps#sitemap"
  get "privacy-policy", to: "pages#privacy_policy"
  get "tos", to: "pages#tos", as: "tos"
  get "brand", to: "pages#brand", as: "brand"
  get "explanation", to: "pages#explanation"

  get "editor", to: "editor#index", as: "editor"
  get "editor/data", "editor#data"
  get "editor/user_projects", "editor#user_projects"
  get "workshop-ui", to: "editor#zez_ui", as: "zez_ui"

  get "active_storage_blob_variant_url/:key", to: "application#active_storage_blob_variant_url"

  namespace :admin do
    root to: "base#index"

    resources :posts, only: [:index, :show, :update, :destroy]
    post "posts/find", to: "posts#find", as: "find_post"

    resources :users, only: [:index, :show, :update]
    post "users/find", to: "users#find", as: "find_user"
    post "users/send_notification", to: "users#send_notification"

    resources :collections, only: [:index, :show]
    post "collections/find", to: "collections#find", as: "find_collection"

    resources :comments, only: [:index, :destroy]
    resources :favorites, only: [:index]
    resources :notifications, only: [:index]
    resources :email_notifications, only: [:index]
    resources :activities, only: [:index]
    resources :reports, only: [:index, :show]
  end

  get "/auth/:provider/callback", to: "sessions#create", as: "oauth"

  post "analytics/post", to: "analytics#post", as: "post_analytics"
  post "analytics/user", to: "analytics#user", as: "user_analytics"

  resources :favorites, only: [:create]
  delete "favorites", to: "favorites#destroy"

  resources :badges, only: [:create]

  resources :comments, only: [:create, :update, :destroy, :show]
  get "create_edit_form/:comment_id", to: "comments#create_edit_form", as: "create_edit_form"
  get "create_reply_form/:comment_id", to: "comments#create_reply_form", as: "create_reply_form"
  get "comments/:id/:page", to: "comments#more", as: "more_comments"

  post "copy-code", to: "posts#copy_code", as: "copy_code"

  post "parse-markdown", to: "posts#parse_markdown", as: "parse_markdown"
  post "get-snippet", to: "posts#get_snippet", as: "get_snippet"
  get "similar_to/:id", to: "posts#similar_to", as: "similar_posts"

  post "ai", to: "open_ai#show", as: "ai"

  resources :articles, param: :slug, except: [:index, :destroy]

  resources :users, param: :username, except: [:new, :index, :edit, :update, :show]
  get "account(/page/:page)", to: "users#show", as: "account"
  get "account/edit", to: "users#edit", as: "edit_user"
  get "account/posts", to: "users#posts", as: "account_posts"
  get "account/collections", to: "users#collections", as: "account_collections"
  get "favorites", to: "users#favorites", as: "account_favorites"
  patch "user", to: "users#update", as: "update_user"
  delete "user", to: "users#destroy", as: "destroy_user"

  resources :sessions, only: [:new, :create, :destroy]

  get "u/:username(/page/:page)", to: "profiles#show", as: "profile"
  patch "profile/edit", to: "profiles#update", as: "update_profile"
  get "profile/edit", to: "profiles#edit", as: "edit_profile"
  get "users/:username", to: redirect { |params| "u/#{ params[:username].gsub("#", "%23") }" }

  resources :blocks, only: [:create, :update, :destroy]
  post "blocks/set_positions", to: "blocks#set_positions"
  post "blocks/show_or_create", to: "blocks#show_or_create"

  get "register", to: "users#new", as: "new_user"
  get "login", to: "sessions#new", as: "login"
  get "logout", to: "sessions#destroy", as: "logout"

  resources :forgot_passwords, param: :token, only: [:index, :create]
  get "forgot-password", to: "forgot_passwords#new", as: "new_forgot_password"
  get "forgot-password/:token", to: "forgot_passwords#show", as: "forgot_password"
  post "reset_password", to: "forgot_passwords#reset_password", as: "reset_password"

  resources :feed, concerns: :paginatable, only: [:index]

  resources :linked_users, only: [:index]
  # For some reason this cannot be merged into the above resources.
  # See https://github.com/EloHellEsports/workshop.codes/pull/123#discussion_r827509566
  delete "linked_users/:id", to: "linked_users#destroy", as: "destroy_linked_user"

  resources :reports, only: [:create, :new, :destroy, :update]
  get "reports/:id/:status", to: "reports#update", as: "report_submit"
  resources :notifications, only: [:index], concerns: :paginatable
  get "unread-notifications", to: "notifications#get_unread_notifications"
  get "unread-notifications-count", to: "notifications#get_unread_notifications_count"

  get "on-fire(/page/:page)", to: "on_fire#index", as: "on_fire"

  resources :revisions, only: [:edit, :update]
  get ":code/revisions", to: "revisions#index", as: "revisions"
  get "revisions/partial/:id", to: "revisions#partial", as: "revisions_partial"
  get "revisions/:id(/:compare_id)", to: "revisions#show", as: "difference"
  get "raw-snippet/:id(.:format)", to: "revisions#raw_snippet", as: "raw_snippet", format: :json

  resources :projects, param: :uuid, format: :json, only: [:show, :create, :update, :destroy]
  resources :project_backups, param: :uuid, format: :json

  get "latest", to: "posts#latest", as: "latest"
  get "page/1", to: redirect("/latest", status: 301)

  get "search", to: "search#show", as: "filter"
  get "filter/partial", to: "filter#partial", as: "filter_partial"
  post "search", to: "search#index", as: "search_post"
  get "(categories/:category)/(heroes/:hero)/(maps/:map)/(exclude-expired/:expired)/(author/:author)/(players/:players)/(code/:code)/(search/:search)/(sort/:sort)/(page/:page)", to: "filter#index", constraints: FilterContraints
  post "(categories/:category)/(heroes/:hero)/(maps/:map)/(exclude-expired/:expired)/(author/:author)/(players/:players)/(code/:code)/(search/:search)/(sort/:sort)/search", to: "search#redirect_to_query_params"
  get "get-verified-users", to: "filter#get_verified_users"
  get "overwatch-2", to: redirect("/", status: 301)

  resources :collections, param: :id, concerns: :paginatable, except: [:show]
  get "c/:nice_url(/page/:page)", to: "collections#show", as: "collection_nice_url"
  get "c/:nice_url/revisions(/page/:page)", to: "collections#revisions", as: "collection_revisions"
  get "c/partial/:id", to: "collections#partial", as: "collection_partial"

  get "derived_from/:post_id", to: "derivatives#derived_from", as: "derived_from"

  constraints code: /.{5,6}/ do
    resources :posts, param: :code, path: "", concerns: :paginatable, except: [:index, :show, :create]
    get ":code", to: "posts#show"
    get ":code/:tab", to: "posts#show", as: "post_tab"
    post "immortalise", to: "posts#immortalise", as: "immortalise_post"
    resources :archives, param: :code, path: "archive", only: [:show, :update, :destroy]
  end

  namespace :wiki do
    root to: "base#index"
    resources :categories, param: :slug, concerns: :paginatable, except: [:show]
    get "categories/:slug(/page/:page)", to: "categories#show"

    resources :articles, param: :slug, concerns: :paginatable
    resources :edits, concerns: :paginatable
    get "edits/article/:group_id", to: "edits#article", as: "article_edits"

    post "search", to: "search#query", as: "search"
    get "search/:query", to: "search#index", as: "search_results"
    get "dictionary", to: "dictionary#index"
  end

  post "/new", to: "posts#create", as: "create_post"

  constraints nice_url: /[a-zA-Z0-9-]+/ do
    get ":nice_url", to: "posts#redirect_nice_url", as: "nice_url", format: false, constraints: lambda { |request|
      request.params[:nice_url].present? && Post.find_by_nice_url(request.params[:nice_url].downcase).present?
    }
  end

  scope "/webhooks", controller: :webhooks do
    post :bugsnag_error_reporting
    post :ko_fi
    get :get_ko_fi_value
  end

  direct :rails_public_blob do |blob|
    if ENV["CDN"].present?
      File.join(ENV["CDN"], blob.key)
    else
      url_for(blob)
    end
  end
end
