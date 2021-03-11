module BlocksHelper
  def block_property(block, property, default = "")
    if block.properties && block.properties[property].present?
      block.properties[property]
    else
      default
    end
  end

  def block_input_name(block, name, multiple = false)
    "[block][#{ block.id }][properties][#{ name }]#{ "[]" if multiple }"
  end

  def block_images(block)
    JSON.parse(block_property(block, "image_blob_ids", "[]")).collect { |i| block.images.find_by_blob_id(i) }
  end
end
