desc "Upgrade wiki articles from old formatting to somewhat fancier formatting"
task upgrade_wiki_articles: :environment do
  actions = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "actions.yml")))
  values = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "values.yml")))
  defaults = YAML.safe_load(File.read(Rails.root.join("config/arrays/wiki", "defaults.yml")))

  user = User.find_by_username("mitsiee")
  user = User.find_by_username("admin") unless user.present?

  (actions + values).each do |current|
    article = Wiki::Article.where(title: current["en-US"]).last

    next if article.blank?
    next if article.content.include?("### Properties")

    content_before_arguments = article.content.split("### Arguments").first.strip
    content_without_return = content_before_arguments.split("### Return").first.strip
    description_only = content_without_return.gsub("### Description", "").strip

    parameters_short = (current["args"] || []).map { |item| "==_#{ item["name"] }_==" }.join(", ")
    parameters_snippet = "(#{ (current["args"] || []).map { |item| defaults[item["default"]] || item["default"] }.join(", ") })"
    parameters_block = (current["args"] || []).map { |item|
      type_array = item["type"].is_a?(String) ? [item["type"] || "Void"] : item["type"]
      type_string_array = []

      type_array.map { |type|
        type_article = Wiki::Article.where(title: type).last if type && type.is_a?(String)
        type_slug = type_article.present? && type_article.category.title === "Constants" ? type_article.slug : nil

        if type.is_a?(String)
          type_string_array.push("**#{ type_slug.present? ? "[#{ type }](/wiki/articles/#{ type_slug })" : (type || "Void") }**")
        else
          type_string_array.push("**#{ type[0] || type.keys[0] }** (**#{ type[1] || type.values[0] }**)")
        end
      }

      default_article = Wiki::Article.where(title: item["default"]).last
      default_slug = default_article.present? && default_article.category.title === "Values" ? default_article.slug : nil
      default_string = item["default"]
      default_string = "[#{ item["default"] }](/wiki/articles/#{ default_slug })" if default_slug.present?

"
> ==**#{ item["name"] }**==
> _Type: #{ type_string_array.join(" | ") }, Default: **#{ default_string }**_
> #{ item["description"] }
".strip
    }.join("\n\n")

    return_array = current["return"].is_a?(String) ? [current["return"]] : current["return"]
    return_string = current["return"].blank? ? "_<span style=\"color: #c678dd\">Void</span>_" : return_array.map { |item|
      return_value_is_string = item.is_a?(String)
      return_value_article = Wiki::Article.where(title: item).last if item.present? && return_string
      return_value_slug = return_value_article.present? && return_value_article.category.title === "Values"  ? return_value_article.slug : nil

      if item.is_a?(String)
        "_<span style=\"color: #c678dd\">#{ return_value_slug.present? ? "[#{ item }](/wiki/articles/#{ return_value_slug })" : (item || "Void") }</span>_"
      else
        "_<span style=\"color: #c678dd\">#{ item[0] || item.keys[0] }</span> (<span style=\"color: #c678dd\">#{ item[1] || item.values[0] }</span>)_"
      end
    }.join(" | ")

    content = "
## Description

#{ description_only == current["description"] ? "<big>#{ description_only }</big>" : description_only }

## Snippet

```
#{ current["en-US"] }#{ current["args"].present? ? parameters_snippet : "" };
```

## Properties

**Returns**: #{ return_string }
**Parameters**: #{ parameters_short.present? ? parameters_short : "_None_" }

#{ parameters_block }
".strip

    next if article.content == content

    puts "============"
    puts content

    article = Wiki::Article.create(
      title: article.title,
      subtitle: article.subtitle,
      slug: CGI.escape(article.title.gsub(/[^0-9a-z ]/i, "").parameterize).gsub("+", "-").downcase,
      group_id: article.group_id,
      content:,
      category_id: article.category.id,
      tags: article.tags,
    )

    edit = Wiki::Edit.create(
      user_id: user.id,
      article_id: article.id,
      content_type: :edited,
      approved: true
    )
  end
end
