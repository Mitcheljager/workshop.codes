class ReportsController < ApplicationController
  before_action only: [:update] do
    redirect_to root_path unless is_admin?(current_user)
  end

  def new
    @report = Report.new
    @post = Post.find(params[:id])
  end

  def create
    @report = Report.new(report_params)
    @report.visit_token = ahoy.visit_token
    @report.user_id = current_user.id if current_user.present?

    respond_to do |format|
      if @report.save
        notify_discord
        format.js
      else
        format.js { render "application/error" }
      end
    end
  end

  def destroy
  end

  def update
    @report = Report.find(params[:id])

    if @report.update(status: params[:status])
      redirect_to admin_reports_path
    end
  end

  private

  def report_params
    params.require(:report).permit(:concerns_id, :concerns_model, :category, :content)
  end

  def notify_discord
    return unless ENV["DISCORD_REPORTS_WEBHOOK_URL"].present?

    report = @report
    post = Post.find(@report.concerns_id)
    path = admin_report_url(@report)
    content = report.content
    visit_token = report.visit_token
    post_url = post_url(post.code)

    embed = Discord::Embed.new do
      title "A post has been reported. (Go to admin)"
      url path
      add_field name: "Visit token", value: report.visit_token
      add_field name: "Report category", value: report.category
      add_field name: "Post title", value: post.title
      add_field name: "Post code", value: post.code.upcase
      add_field name: "Post url", value: post_url
      add_field name: "Description", value: content
    end

    Discord::Notifier.message(embed, url: ENV["DISCORD_REPORTS_WEBHOOK_URL"])
  end
end
