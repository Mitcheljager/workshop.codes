module ActiveStorageRenameFile
  extend ActiveSupport::Concern

  included do
    before_create :rename_file
  end

  private

  def rename_file
    self.filename = SecureRandom.hex if filename.present?
  end
end

ActiveSupport.on_load(:active_storage_blob) do
  include ActiveStorageRenameFile
end
