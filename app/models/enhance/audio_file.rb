class Enhance::AudioFile < ApplicationRecord
  belongs_to :user

  has_many_attached :file, dependent: :destroy

  validates :file, content_type: ["audio/mpeg", "audio/wav", "audio/ogg"], size: { less_than: 10.megabytes }
end
