class FilterContraints
  def self.matches?(request)
    request.path_parameters.without(:controller, :action, :page).length > 0
  end
end

Rails.application.routes.draw do
  concern :paginatable do
    get "(page/:page)", action: :index, on: :collection, as: ""
  end

  get "/404", to: "errors#not_found"
  get "/422", to: "errors#unacceptable"
  get "/500", to: "errors#internal_error"

  get "sitemap", to: "sitemaps#sitemap"
  get "privacy-policy", to: "pages#privacy_policy"

  namespace :admin do
    root to: "base#index"

    resources :posts, only: [:index, :show, :update, :destroy]
    post "posts/find", to: "posts#find", as: "find_post"

    resources :users, only: [:index, :show, :update]
    post "users/find", to: "users#find", as: "find_user"
    post "users/send_notification", to: "users#send_notification"

    resources :comments, only: [:index]
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

  post "copy-code", to: "posts#copy_code", as: "copy_code"

  post "parse-markdown", to: "posts#parse_markdown", as: "parse_markdown"
  post "get-snippet", to: "posts#get_snippet", as: "get_snippet"

  scope "(:locale)", locale: /#{I18n.available_locales.join("|")}/, default: "en" do
    root "posts#index"

    resources :users, param: :username, except: [:new, :index, :edit, :update, :show]
    get "account(/page/:page)", to: "users#show", as: "account"
    get "account/edit", to: "users#edit", as: "edit_user"
    get "account/posts", to: "users#posts", as: "account_posts"
    get "favorites", to: "users#favorites", as: "account_favorites"
    patch "user", to: "users#update", as: "update_user"
    delete "user", to: "users#destroy", as: "destroy_user"

    get "account/accessibility", to: "accessibility#edit", as: "accessibility"
    patch "account/accessibility", to: "accessibility#update", as: "update_accessibility"

    resources :sessions, only: [:new, :create, :destroy]

    get "u/:username(/page/:page)", to: "profiles#show", as: "profile"
    patch "profile/edit", to: "profiles#update", as: "update_profile"
    get "profile/edit", to: "profiles#edit", as: "edit_profile"
    get "users/:username", to: redirect { |params| "u/#{ params[:username].gsub("#", "%23") }" }

    resources :blocks, only: [:create, :update, :destroy]
    post "blocks/set_positions", to: "blocks#set_positions"

    get "register", to: "users#new", as: "new_user"
    get "login", to: "sessions#new", as: "login"
    get "logout", to: "sessions#destroy", as: "logout"

    resources :forgot_passwords, param: :token, only: [:index, :create]
    get "forgot-password", to: "forgot_passwords#new", as: "new_forgot_password"
    get "forgot-password/:token", to: "forgot_passwords#show", as: "forgot_password"
    post "reset_password", to: "forgot_passwords#reset_password", as: "reset_password"

    resources :reports, only: [:create, :new, :destroy, :update]
    resources :notifications, only: [:index], concerns: :paginatable
    get "unread-notifications", to: "notifications#get_unread_notifications"
    get "unread-notifications-count", to: "notifications#get_unread_notifications_count"

    get "on-fire(/page/:page)", to: "posts#on_fire", as: "on_fire"
    get "while-you-wait(/:filter)", to: "while_you_waits#index", as: "while_you_wait"

    resources :revisions, only: [:edit, :update]
    get ":code/revisions", to: "revisions#index", as: "revisions"
    get "revisions/:id(/:compare_id)", to: "revisions#show", as: "difference"
    get "raw-snippet/:id(.:format)", to: "revisions#raw_snippet", as: "raw_snippet", format: :json

    get "(page/:page)", to: "posts#index"
    get "(categories/:category)/(heroes/:hero)/(maps/:map)/(from/:from)/(to/:to)/(exclude-expired/:expired)/(author/:author)/(search/:search)/(sort/:sort)/(language/:language)/(page/:page)", to: "filter#index", as: "filter", constraints: FilterContraints
    post "(categories/:category)/(heroes/:hero)/(maps/:map)/(from/:from)/(to/:to)/(exclude-expired/:expired)/(author/:author)/(search/:search)/(sort/:sort)/(language/:language)/search", to: "search#index", as: "search_post"
    get "search", to: "search#show"
    get "get-verified-users", to: "filter#get_verified_users"

    resources :collections, path: "c", param: :nice_url, concerns: :paginatable, only: [:index, :edit, :update, :destroy]
    get "c/:nice_url(/page/:page)", to: "collections#show"

    constraints code: /.{5,6}/ do
      resources :posts, param: :code, path: "", concerns: :paginatable, except: [:index, :show, :create]
      get ":code", to: "posts#show"
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
end
