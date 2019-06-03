Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root "posts#index"

  resources :users, param: :username, except: [:new, :index]
  get "account(/page/:page)", to: "users#account", as: "account"

  resources :sessions, only: [:new, :create, :destroy]

  get "register", to: "users#new", as: "new_user"
  get "login", to: "sessions#new", as: "login"
  get "logout", to: "sessions#destroy", as: "logout"

  resources :favorites, only: [:create]
  delete "favorites", to: "favorites#destroy"

  concern :paginatable do
    get "(page/:page)", action: :index, on: :collection, as: ""
  end

  get "on-fire(/page/:page)", to: "posts#on_fire", as: "on_fire"
  resources :posts, param: :code, path: "", concerns: :paginatable, except: [:index]
  get "categories/:category(/page/:page)", to: "posts#category", as: "category"
  get "heroes/:hero(/page/:page)", to: "posts#hero", as: "hero"
  get "maps/:map(/page/:page)", to: "posts#map", as: "map"
  get "search/:search(/page/:page)", to: "posts#search", as: "search"
end
