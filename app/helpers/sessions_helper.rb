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
end
