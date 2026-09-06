class ThemesController < ApplicationController
  def switch
    theme = params[:theme]

    if ["default", "talon", "high-contrast"].include?(theme)
      cookies[:theme] = {
        value: params[:theme],
        expires: 1.year.from_now
      }
    end

    redirect_back(fallback_location: root_path)
  end

  def partial
    render partial: "theme_switch_content"
  end
end
