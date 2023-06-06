include PostsHelper

class ReportsController < ApplicationController
  before_action only: [:update] do
    redirect_to root_path unless is_admin?(current_user)
  end

  def new
    @report = Report.new

    if params[:concerns_model] == "post"
      @post = Post.find(params[:id])
    elsif params[:concerns_model] == "comment"
      @comment = Comment.find(params[:id])
    else
      raise ActionController::RoutingError.new("Not Found")
    end

    render partial: "modal"
  end

  def create
    @report = Report.new(report_params)
    @report.visit_token = ahoy.visit_token
    @report.user_id = current_user.id if current_user.present?

    respond_to do |format|
      if @report.save
        if report_params[:concerns_model] == "post"
          notify_discord_post
        elsif report_params[:concerns_model] == "comment"
          notify_discord_comment
        end

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
      redirect_to admin_reports_path and return unless @report.accepted?
      redirect_to admin_report_path @report
    end
  end

  private

  def report_params
    params.require(:report).permit(:concerns_id, :concerns_model, :category, :content, :reported_user_id, properties: {})
  end

  def notify_discord_post
    return unless ENV["DISCORD_REPORTS_WEBHOOK_URL"].present?

    report = @report
    path = admin_report_url(@report)
    content = report.content
    visit_token = report.visit_token
    accept_url = report_submit_url(report.id, :accepted)
    reject_url = report_submit_url(report.id, :rejected)

    post = Post.find(report.concerns_id)
    post_url = post_url(post.code)
    admin_post_url = admin_post_url(post.id)

    image = ""
    if post.images.any? && post.image_order.present? && JSON.parse(post.image_order).length
      image = url_for_post_thumbnail(post, 240, 128, "medium")
    end

    embed = Discord::Embed.new do
      title "A post has been reported. (Go to admin)"
      url path
      thumbnail url: image
      add_field name: "Report data", value: "
        #{ report.visit_token }
        #{ report.concerns_model }: #{ report.concerns_id }
      "
      add_field name: "Post data", value: "
        **Title**: #{ post.title }
        **Code**: #{ post.code }
        **Has snippet**: #{ post.snippet.present? }
        **Description start**: #{ post.description.truncate(200) }
      "
      add_field name: "Report category", value: report.category
      add_field name: "Report description", value: content
      add_field name: "Actions", value: "
        [View in admin](#{ admin_post_url })
        [View post](#{ post_url })

        [Accept](#{ accept_url })
        [Reject](#{ reject_url })
      "
    end

    Discord::Notifier.message(embed, url: ENV["DISCORD_REPORTS_WEBHOOK_URL"])
  end

  def notify_discord_comment
    return unless ENV["DISCORD_REPORTS_WEBHOOK_URL"].present?

    report = @report
    path = admin_report_url(@report)
    content = report.content
    visit_token = report.visit_token
    accept_url = report_submit_url(report.id, :accepted)
    reject_url = report_submit_url(report.id, :rejected)

    comment = Comment.find(report.concerns_id)
    comment_content = comment.content

    embed = Discord::Embed.new do
      title "A comment has been reported. (Go to admin)"
      url path
      add_field name: "Report data", value: "
        #{ report.visit_token }
        #{ report.concerns_model }: #{ report.concerns_id }
      "
      add_field name: "Report category", value: report.category
      add_field name: "Report description", value: content
      add_field name: "Comment content", value: comment_content
      add_field name: "Actions", value: "
        [Accept](#{ accept_url })
        [Reject](#{ reject_url })
      "
    end

    Discord::Notifier.message(embed, url: ENV["DISCORD_REPORTS_WEBHOOK_URL"])
  end
end
