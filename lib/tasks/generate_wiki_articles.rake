desc "Generate wiki articles. This file is ugly. Please don't judge."
task :generate_wiki_articles => :environment do
  actions = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
  events = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "events.yml")))
  values = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))
  constants = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "constants.yml")))

  @user = User.find_by_username("mitsiee")
  @user = User.find_by_username("admin") unless @user.present?

  # Actions

  @category = Wiki::Category.find_by_title("Actions")
  @category = Wiki::Category.create(title: "Actions", slug: "actions") unless @category.present?

  actions.each do |name, content|
    @article = Wiki::Article.find_by_title(content["en-US"])
    next if @article.present?

    if content["args"] && content["args"].any?
      subtitle = content["args"].map { |arg| arg["name"].humanize }.join(", ")

      content_args = "
### Arguments
#{ content["args"].to_yaml(options = {line_width: -1}).gsub("---", "").gsub("- name:", "\n> name:").gsub("name:", "**Name**:").gsub("description:", "**Description**:").gsub("type:", "**Type**:").gsub("default:", "**Default**:") }"
    end

    @article = Wiki::Article.create(
      title: content["en-US"],
      subtitle: "#{ subtitle if subtitle }",
      slug: CGI.escape(content["en-US"]).downcase,
      group_id: SecureRandom.urlsafe_base64,
      content: "### Description
      #{ content["description"] }
      #{ content_args if content_args }",
      category_id: @category.id,
      tags: "#{ content["en-US"] }"
    )

    @edit = Wiki::Edit.create(
      user_id: @user.id,
      article_id: @article.id,
      content_type: "created",
      approved: true
    )
  end

  # Events

  @category = Wiki::Category.find_by_title("Events")
  @category = Wiki::Category.create(title: "Events", slug: "events") unless @category.present?

  events.each do |name, content|
    @article = Wiki::Article.find_by_title(content["en-US"])
    next if @article.present?

    @article = Wiki::Article.create(
      title: content["en-US"],
      slug: CGI.escape(content["en-US"]).downcase,
      group_id: SecureRandom.urlsafe_base64,
      category_id: @category.id,
      tags: "#{ content["en-US"] }"
    )

    @edit = Wiki::Edit.create(
      user_id: @user.id,
      article_id: @article.id,
      content_type: "created",
      approved: true
    )
  end

  # Values

  @category = Wiki::Category.find_by_title("Values")
  @category = Wiki::Category.create(title: "Values", slug: "values") unless @category.present?

  values.each do |name, content|
    @article = Wiki::Article.find_by_title(content["en-US"])
    next if @article.present?

    if content["args"] && content["args"].any?
      subtitle = content["args"].map { |arg| arg["name"].humanize }.join(", ")

      content_args = "
### Arguments
#{ content["args"].to_yaml(options = {line_width: -1}).gsub("---", "").gsub("- name:", "\n> name:").gsub("name:", "**Name**:").gsub("description:", "**Description**:").gsub("type:", "**Type**:").gsub("default:", "**Default**:") }"
    end

    if content["return"]
      content_return = "
### Return
> #{ content["return"].to_yaml(options = {line_width: -1}).gsub("---", "").gsub("...", "").humanize }"
    end

    @article = Wiki::Article.create(
      title: content["en-US"],
      subtitle: "#{ subtitle if subtitle }",
      slug: CGI.escape(content["en-US"]).downcase,
      group_id: SecureRandom.urlsafe_base64,
      content: "### Description
      #{ content["description"] }
      #{ content_return if content_return }
      #{ content_args if content_args }",
      category_id: @category.id,
      tags: "#{ content["en-US"] }"
    )

    @edit = Wiki::Edit.create(
      user_id: @user.id,
      article_id: @article.id,
      content_type: "created",
      approved: true
    )
  end

  # Constants

  @category = Wiki::Category.find_by_title("Constants")
  @category = Wiki::Category.create(title: "Constants", slug: "constants") unless @category.present?

  constants.each do |name, content|
    @article = Wiki::Article.find_by_title(name.gsub("__", ""))
    next if @article.present?

    article_content = "## Options"
    content.each do |item, args|
      article_content << "
- **#{ args["en-US"] }** #{ "\n  - " + args["description"] if args["description"] }"
    end

    @article = Wiki::Article.create(
      title: name.gsub("__", ""),
      slug: name.gsub("__", "").downcase,
      group_id: SecureRandom.urlsafe_base64,
      category_id: @category.id,
      content: article_content
    )

    @edit = Wiki::Edit.create(
      user_id: @user.id,
      article_id: @article.id,
      content_type: "created",
      approved: true
    )
  end
end
