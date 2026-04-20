# https://stackoverflow.com/questions/71990425/rails-active-storage-keep-existing-files-uploads/74207496#74207496

module AppendToHasManyAttached
  def self.[](fields)
    Module.new do
      extend ActiveSupport::Concern

      fields = Array(fields).compact_blank

      fields.each do |field|
        field = field.to_s
        define_method :"#{field}=" do |attachables|
          attachables = Array(attachables).compact_blank

          if attachables.any?
            attachment_changes[field] =
              ActiveStorage::Attached::Changes::CreateMany.new(field, self, public_send(field).public_send(:blobs) + attachables)
          end
        end
      end
    end
  end
end