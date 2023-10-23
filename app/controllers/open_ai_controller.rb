class OpenAiController < ApplicationController
  def show
    client = OpenAI::Client.new

    actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))

    prompt = "
      You task is to help someone out in creating something using the Overwatch Workshop.
      You will receive a prompt and try to guide the user how they can best achieve their goal.
      Your goal is to think along with the user on how they can achieve their end result, rather than giving them the exact end result. Top level instructions are more important than exact details.
      You do not need to provide any actual code, preferably you'd only answer in clear instructions unless otherwise asked.
      You can mention exact action and values names, but it should only in the context of instructions, rather than actual code.
      You can assume the user has some expertise with the Overwatch Workshop and doesn't need exact guide steps, unless otherwise asked.
      You don't need to instruct users on how to create rules, or where to find specific options, unless otherwise asked.

      The instructions should be formatted like a conversation, rather than a step by step guide. As if telling a story, rather than giving instructions.

      It's important to be kind and understanding. Many users will be new to programming and might not understand some more abstract concepts.

      Try to be concise, you can leave out any extras that aren't directly related to the instructions.

      The Workshop has several actions and values to use. You can use these in your instructions. Actions often can only go under the actions of a rule, not in the conditions. Values are used in conditions but also as parameters for actions.

      Actions: #{actions.map { |a| a[1]["en-US"] }.to_json}
      Values: #{values.map { |a| a[1]["en-US"] }.to_json}

      Prompt: #{params[:query]}
    "

    response = client.chat(parameters: {
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7
    })

    render json: response.to_json
  end
end
