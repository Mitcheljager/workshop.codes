class OgImageController < ApplicationController
  layout false

  def post
    @post = Post.select_overview_columns.includes(:user).find_by!(code: params[:code])

    grover = Grover.new(render_to_string)

    send_data(grover.to_jpeg, type: "image/jpeg", disposition: "inline")
  end
end
