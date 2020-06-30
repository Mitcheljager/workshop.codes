module Wiki::BaseHelper
  def string_to_wiki_model(string)
    ("Wiki::" + string.camelize).constantize
  end
end
