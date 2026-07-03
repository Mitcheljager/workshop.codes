class Admin::AttachmentsController < Admin::BaseController
  def index
    @attachments = ActiveStorage::Attachment.where.not(record_type: "ActiveStorage::VariantRecord").order(created_at: :desc).page(params[:page]).per(50)
  end
end
