class OpenAiController < ApplicationController
  def show
    client = OpenAI::Client.new

    response = client.chat(parameters: {
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: params[:query]
      }],
      temperature: 0.7
    })

    render json: response.to_json
  end
end
