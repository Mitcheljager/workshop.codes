class WebhooksController < ApplicationController
  protect_from_forgery with: :null_session

  def bugsnag_error_reporting
    return unless ENV["DISCORD_BUGSNAG_WEBHOOK_URL"].present?

    type = params["trigger"]["type"]
    message = params["trigger"]["message"]
    rate = params["trigger"]["rate"]
    error_message = params["error"]["message"]
    datetime = params["error"]["receivedAt"]

    embed = Discord::Embed.new do
      color "#ff0000"
      title "😯 Something is going wrong with Workshop.codes"
      description "#{ type }: **#{ message }** \n\n #{ error_message }"
      add_field name: "Rate", value: rate if rate.present?
      add_field name: "Datetime", value: datetime
    end

    Discord::Notifier.message(embed, url: ENV["DISCORD_BUGSNAG_WEBHOOK_URL"], username: "Workshop.codes Errors")
  end
end
