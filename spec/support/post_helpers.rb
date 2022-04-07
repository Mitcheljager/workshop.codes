module Helpers
  module Posts
    def fill_in_post_form
      post_attrs = attributes_for(:post)

      # Header
      fill_in "post_title", with: post_attrs[:title]
      fill_in "post_code", with: post_attrs[:code]

      # Settings
      click_on "Settings"
      post_attrs[:categories].each do |category|
        select(category, from: "post_categories")
      end
      # Simulating actualy clicking/pressing/dragging is a pain with Capybara
      slider = page.evaluate_script "slider=document.querySelector('[data-role=\"num-player-slider\"][data-type=\"post\"]');"
      page.execute_script "const slider = arguments[0]; slider.noUiSlider.set([#{ post_attrs[:min_players] }, #{ post_attrs[:max_players] }]);", slider

      # Heroes
      click_on "Heroes"
      post_attrs[:heroes].each do |hero|
        check(hero)
      end

      # Maps
      click_on "Maps"
      post_attrs[:maps].each do |map|
        check(map)
      end

      # Return to default tab
      click_on "Description"
    end
  end
end
