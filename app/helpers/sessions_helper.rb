module SessionsHelper
  def provider_nice_name(provider)
    case provider.to_s.downcase
    when "bnet"
      "Battle.net"
    when "discord"
      "Discord"
    else
      "OAuth"
    end
  end

  def clean_up_session_auth
    session.delete "oauth_provider"
    session.delete "oauth_uid"
    session.delete "oauth_expires_at"
  end
end
