module VariantHelper
  def original_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 95).processed)
  end

  def landscape_large_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 95, resize_to_fill: [900, 500], format: :webp).processed)
  end

  def landscape_small_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 95, resize_to_fill: [600, 342], format: :webp).processed)
  end

  def landscape_tiny_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 95, resize_to_fill: [450, 250], format: :webp).processed)
  end

  def square_tiny_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 95, resize_to_fill: [120, 120], format: :webp).processed)
  end

  def banner_small_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 75, resize_to_fill: [640, 400]).processed)
  end

  def banner_medium_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 75, resize_to_fill: [960, 400]).processed)
  end

  def banner_large_variant_public_url(image)
    rails_public_blob_url(image.variant(quality: 75, resize_to_fill: [1920, 400]).processed)
  end
end
