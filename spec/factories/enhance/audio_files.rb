FactoryBot.define do
  factory :enhance_audio_file, class: 'Enhance::AudioFile' do
    user_id { 1 }
    name { "MyString" }
  end
end
