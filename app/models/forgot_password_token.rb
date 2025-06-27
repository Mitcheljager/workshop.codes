class ForgotPasswordToken < ApplicationRecord
  belongs_to :user

  # This is used purely as a honeypot
  attr_accessor :email_confirmation
end
