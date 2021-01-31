module BlocksHelper
  def block_property(block, property)
    if block.properties && block.properties[property]
      return block.properties[property]
    else
      return ""
    end
  end
end
