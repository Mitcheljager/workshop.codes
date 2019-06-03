Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root "posts#index"

  concern :paginatable do
    get "(page/:page)", action: :index, on: :collection, as: ""
  end

  resources :users, param: :username, except: [:new, :index]
  get "account", to: "users#account", as: "account", concerns: :paginatable

  resources :sessions, only: [:new, :create, :destroy]

  get "register", to: "users#new", as: "new_user"
  get "login", to: "sessions#new", as: "login"
  get "logout", to: "sessions#destroy", as: "logout"

  resources :favorites, only: [:create]
  delete "favorites", to: "favorites#destroy"

  get "on-fire", to: "posts#on_fire", as: "on_fire", concerns: :paginatable
  resources :posts, param: :code, path: "", concerns: :paginatable, except: [:index]
  get "categories/:category", to: "posts#category", as: "category", concerns: :paginatable
  get "heroes/:hero", to: "posts#hero", as: "hero", concerns: :paginatable
  get "maps/:map", to: "posts#map", as: "map", concerns: :paginatable
  get "search/:search", to: "posts#search", as: "search", concerns: :paginatable
end
