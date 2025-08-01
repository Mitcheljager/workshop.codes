module CurrentUserHandler
  extend ActiveSupport::Concern

  included do
    before_action :reject_if_banned
    before_action :expire_oauth_session

    helper_method :current_user
  end

  def current_user
    @current_user = nil

    if session[:user_id]
      @current_user ||= User.find_by(id: session[:user_id])

      # Invalidate the session if a UUID is specified and the user's UUID does not match
      if session[:user_uuid].present? && @current_user&.uuid != session[:user_uuid]
        reset_session
        @current_user = nil
      end
    end

    @current_user
  end

  def reject_if_banned
    reset_session if current_user.present? && current_user.level == "banned"
  end

  def expire_oauth_session
    if (session[:oauth_uid].present? || session[:oauth_provider].present?) && session[:oauth_expires_at].blank?
      clean_up_session_auth
      flash[:error] = "Invalid temporary OAuth session."
      return
    end
    if session[:oauth_expires_at].present? && Time.now > session[:oauth_expires_at]
      clean_up_session_auth
      flash[:warning] = "Temporary session expired."
    end
  end
end
