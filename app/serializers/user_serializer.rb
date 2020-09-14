class UserSerializer < ActiveModel::Serializer
  attributes :username, :nice_url, :verified

  has_many :posts
end
