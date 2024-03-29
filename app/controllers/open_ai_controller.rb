class OpenAiController < ApplicationController
  def show
    @article = Wiki::Article.includes(:category).select(:id, :title, :category_id).find_by_id(params[:article_id])
    render "application/error" and return if @article.nil?

    if @article.category.title != "Actions" && @article.category.title != "Values"
      @message = "Your request did not match a known category. This is probably our fault!"
      render "application/error" and return
    end

    description = ""
    found_match = false
    merged_array.each do |item|
      if item.is_a?(Array) && item[1].is_a?(Hash) && item[1]['en-US'] == @article.title
        found_match = true
        description = item[1]['description']
        break
      end
    end

    if !found_match
      @message = "Your request did not match a known Workshop value. This is probably our fault!"
      render "application/error" and return
    end

    prompt = "Explain the #{ @article.category.title} \"#{@article.title }\".
      #{ "The description given in-game is \"#{description}\". Feel free to use this description to improve your explanation, or feel free to ignore it." if description.present? }"

    begin
      client = OpenAI::Client.new

      response = client.chat(parameters: {
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: system_prompt
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
      })

      @message = markdown(response["choices"][0]["message"]["content"])

      respond_to do |format|
        format.js
      end
    rescue => exception
      Bugsnag.notify(exception) if Rails.env.production?
      render "application/error"
    end
  end

  private

  def merged_array
    actions = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
    values = YAML.load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))

    actions.merge(values)
  end

  def system_prompt
    "You are a teacher, trying your best to explain programming terms within the context of the Overwatch Workshop.
      You will be asked a question about a specific Overwatch Workshop topic, your job is to explain that topic as well as you can.
      While many of the questions you will be asked are about specific Overwatch Workshop tools, many of them will apply to programming in general.
      You may assume that the questions are asked by someone with very limited programming knowledge, but with large knowledge of Overwatch itself.
      Because of this it might be useful to explain something within the context of Overwatch.
      Try to explain with words rather than actual code. Don't provide any actual code. The actual implementation is not important.
      Don't summarise the content at the end of your explanation.
      Please use Markdown to make certain keywords bold or italic."
  end
end
