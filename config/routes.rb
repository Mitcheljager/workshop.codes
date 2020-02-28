Rails.application.routes.draw do
  root "posts#index"

  get "sitemap", to: "sitemaps#sitemap"

  get "admin", to: "admin#index", as: "admin"
  namespace :admin do
    get "post/:id", action: "post", as: "post"
    get "posts"
    get "comments"
    get "favorites"
    get "users"
    get "notifications"
    get "email_notifications"
    get "activities"
  end

  resources :users, param: :username, except: [:new, :index, :edit, :update]
  get "account(/page/:page)", to: "users#account", as: "account"
  get "account/edit", to: "users#edit", as: "edit_user"
  get "account/posts", to: "users#posts", as: "account_posts"
  get "favorites", to: "users#favorites", as: "account_favorites"
  patch "user", to: "users#update", as: "update_user"
  delete "user", to: "users#destroy", as: "destroy_user"

  resources :sessions, only: [:new, :create, :destroy]

  get "register", to: "users#new", as: "new_user"
  get "login", to: "sessions#new", as: "login"
  get "logout", to: "sessions#destroy", as: "logout"

  resources :forgot_passwords, param: :token, only: [:index, :create]
  get "forgot-password", to: "forgot_passwords#new", as: "new_forgot_password"
  get "forgot-password/:token", to: "forgot_passwords#show", as: "forgot_password"
  post "reset_password", to: "forgot_passwords#reset_password", as: "reset_password"

  resources :favorites, only: [:create]
  delete "favorites", to: "favorites#destroy"

  resources :comments, only: [:create, :update, :destroy]
  get "create_edit_form/:comment_id", to: "comments#create_edit_form", as: "create_edit_form"
  get "create_reply_form/:comment_id", to: "comments#create_reply_form", as: "create_reply_form"

  concern :paginatable do
    get "(page/:page)", action: :index, on: :collection, as: ""
  end

  resources :notifications, only: [:index], concerns: :paginatable

  resources :activities, only: [:index], concerns: :paginatable

  get "on-fire(/page/:page)", to: "posts#on_fire", as: "on_fire"
  get "while-you-wait", to: "while_you_waits#index", as: "while_you_wait"

  post "copy-code", to: "posts#copy_code", as: "copy_code"
  resources :revisions, only: [:edit, :update]
  resources :posts, param: :code, path: "", concerns: :paginatable, except: [:index]
  post "parse-markdown", to: "posts#parse_markdown", as: "parse_markdown"
  get "/(categories/:category)/(heroes/:hero)/(maps/:map)/(from/:from)/(to/:to)/(exclude-expired/:expired)/(search/:search)/(sort/:sort)/(page/:page)", to: "posts#filter", as: "filter"
  post "/(categories/:category)/(heroes/:hero)/(maps/:map)/(from/:from)/(to/:to)/(exclude-expired/:expired)/(search/:search)/(sort/:sort)/search", to: "search#index", as: "search_post"
end
