class SerializedArrayLengthValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless options.key?(:maximum)
    return unless value
    maximum = options[:maximum]
    return unless value.count > maximum

    record.errors.add(attribute, :too_long_array, count: maximum)
  end
end

class UniquenessAgainstNiceUrlValidator < ActiveModel::Validator
  def validate(record)
    if record.username.present?
      user_with_nice_url = User.find_by("upper(nice_url) = ?", record.username.upcase)

      if user_with_nice_url.present? && user_with_nice_url != record
        record.errors[:username] << "is not available."
      end
    end
  end
end

class User < ApplicationRecord
  has_secure_password

  has_many :posts, dependent: :destroy
  has_many :remember_tokens, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :forgot_password_tokens, dependent: :destroy
  has_many :collections, dependent: :destroy
  has_many :reports, dependent: :destroy
  has_many :reports_of_user, class_name: "Report", foreign_key: :reported_user_id, dependent: :destroy
  has_many :linked_users, class_name: "User", foreign_key: :linked_id, dependent: :destroy
  has_many :badges, dependent: :destroy
  has_many :wiki_edits, class_name: "Wiki::Edit", dependent: :destroy
  has_many :blocks
  has_many :visits, class_name: "Ahoy::Visit"

  has_one_attached :profile_image, dependent: :destroy
  has_one_attached :banner_image, dependent: :destroy

  serialize :featured_posts

  enum level: { regular: 0, admin: 1, banned: 2, arbiter: 3 }
  enum pagination_type: { infinite_scroll: 0, load_more: 1, pagination: 2 }

  encrypts :email
  blind_index :email

  validates :username, presence: true, uniqueness: { case_sensitive: false }, uniqueness_against_nice_url: true, format: { with: /\A[\d\p{L}_-]*[#\d]*\z/i }, length: { maximum: 32 }
  validates :password, presence: true, length: { minimum: 8 }, if: :password
  validates :email, uniqueness: true, allow_blank: true, length: { maximum: 100 }
  validates :link, allow_blank: true, format: URI::regexp(%w[http https])
  validates :description, length: { maximum: 255 }
  validates :nice_url, uniqueness: true, allow_blank: true
  validates :featured_posts, allow_blank: true, serialized_array_length: { maximum: 3 }
  validates :profile_image, content_type: ["image/jpeg", "image/jpg", "image/png"],
                            size: { less_than: 2.megabytes },
                            dimension: { max: 3500..3500 }
  validates :banner_image, content_type: ["image/jpeg", "image/jpg", "image/png"],
                            size: { less_than: 2.megabytes },
                            dimension: { max: 3500..3500 }

  def self.find_or_create_from_auth_hash(auth_hash)
    uid = auth_hash["uid"]
    provider = auth_hash["provider"]
    username = auth_hash["info"]["name"] || auth_hash["info"]["battletag"]

    # If a user logs in with Discord their discrimimator only gets added if
    # a user with that username already exists. This could be another Discord
    # user or a Workshop.codes account.
    if (auth_hash["provider"] == "discord")
      username_exists_for_other_user = User.find_by("lower(username) = ?", username.downcase)

      if username_exists_for_other_user.present? && username_exists_for_other_user.uid != uid
        discrimimator = auth_hash["extra"]["raw_info"]["discriminator"]
        username = username + "#" + discrimimator
      end
    end

    user = find_or_create_by(uid: uid, provider: provider)

    user.username = username
    user.username.gsub!(" ", "-")
    user.provider_profile_image = auth_hash["info"]["image"]
    user.password = "no_password"

    user if user.save
  end

  def clean_username
    self.username.split("#")[0]
  end
end
