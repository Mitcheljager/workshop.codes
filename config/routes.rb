Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root "posts#index"

  resources :users, param: :username, except: [:new, :index, :edit, :update]
  get "account(/page/:page)", to: "users#account", as: "account"
  get "edit", to: "users#edit", as: "edit_user"
  patch "user", to: "users#update", as: "update_user"
  delete "user", to: "users#destroy", as: "destroy_user"

  resources :sessions, only: [:new, :create, :destroy]

  get "register", to: "users#new", as: "new_user"
  get "login", to: "sessions#new", as: "login"
  get "logout", to: "sessions#destroy", as: "logout"

  resources :favorites, only: [:create]
  delete "favorites", to: "favorites#destroy"

  resources :comments, only: [:create, :destroy]
  get "create_reply_form/:comment_id", to: "comments#create_reply_form", as: "create_reply_form"

  concern :paginatable do
    get "(page/:page)", action: :index, on: :collection, as: ""
  end

  resources :snippets, param: :unique_id, concerns: :paginatable
  get "snippets/search/:search(/page/:page)", to: "snippets#search", as: "search_snippets"

  get "on-fire(/page/:page)", to: "posts#on_fire", as: "on_fire"
  resources :posts, param: :code, path: "", concerns: :paginatable, except: [:index]
  get "categories/:category(/:sort)(/page/:page)", to: "posts#category", as: "category"
  get "heroes/:hero(/:sort)(/page/:page)", to: "posts#hero", as: "hero"
  get "maps/:map(/:sort)(/page/:page)", to: "posts#map", as: "map"
  get "search/:search(/page/:page)", to: "posts#search", as: "search"
  post "search(/:type)", to: "search#index", as: "search_post"
end
