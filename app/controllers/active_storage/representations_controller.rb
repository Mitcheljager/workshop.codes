# frozen_string_literal: true

# Take a signed permanent reference for a blob representation and turn it into an expiring service URL for download.
# Note: These URLs are publicly accessible. If you need to enforce access protection beyond the
# security-through-obscurity factor of the signed blob and variation reference, you'll need to implement your own
# authenticated redirection controller.
class ActiveStorage::RepresentationsController < ActiveStorage::BaseController
  include ActiveStorage::SetBlob

  def show
    expires_in 10.years, public: true
    variant = @blob.representation(params[:variation_key]).processed
    send_data @blob.service.download(variant.key),
              type: @blob.content_type || DEFAULT_SEND_FILE_TYPE,
              disposition: "inline"
  end
end
