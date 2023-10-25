class OpenAiController < ApplicationController
  def show
    client = OpenAI::Client.new

    @actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    @values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))

    merged_array = @actions.merge(@values)

    description = ""
    merged_array.each do |item|
      if item.is_a?(Array) && item[1].is_a?(Hash) && item[1]['en-US'] == params[:prompt]
        description = item[1]['description']
        break
      end
    end

    prompt = "
      You are a teacher, trying your best to explain programming terms within the context of the Overwatch Workshop.
      You will be asked a question about a specific Overwatch Workshop topic, your job is to explain that topic as well as you can.
      While many of the questions you will be asked are about specific Overwatch Workshop tools, many of them will apply to programming in general.
      You may assume that the questions are asked by someone with very limited programming knowledge, but with large knowledge of Overwatch itself.
      Because of this it might be useful to explain something within the context of Overwatch.
      Please use Markdown to make certain keywords bold or italic.

      Explain the #{params[:category]} \"#{params[:prompt]}\"

      #{ "The description given in-game is \"#{description}\". Feel free to use this description to improve your explanation, or feel free to ignore it." if description.present? }
    "

    response = client.chat(parameters: {
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
    })

    @message = markdown(response["choices"][0]["message"]["content"])

    respond_to do |format|
      format.js
    end
  end
end
