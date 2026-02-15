module RememberTokenHandler
  extend ActiveSupport::Concern

  included do
    before_action :login_from_remember_token_cookie

    helper_method :refresh_remember_token_cookie
    helper_method :destroy_remember_token_cookie
  end

  COOKIE_NAME = :remember_token

  def login_from_remember_token_cookie
    return if current_user
    return if cookies[COOKIE_NAME].blank?

    token = RememberToken.find_by_token(cookies.encrypted[COOKIE_NAME])

    if token&.user
      reset_session

      session[:user_id] = token.user.id
      session[:user_uuid] = token.user.uuid

      refresh_remember_token_cookie

      create_activity(:login_from_cookie)
    else
      destroy_remember_token_cookie
    end
  end

  # Either refresh the duration of the current cookie, or generate a new token and set a new cookie
  def refresh_remember_token_cookie
    value = cookies.encrypted[COOKIE_NAME] || generate_remember_token

    cookies.encrypted[COOKIE_NAME] = {
      value:,
      expires: 1.year.from_now
    }
  end

  def destroy_remember_token_cookie
    cookies.delete COOKIE_NAME
  end

  private

  def generate_remember_token
    token = SecureRandom.base64
    RememberToken.create(user_id: current_user.id, token:)

    token
  end
end
