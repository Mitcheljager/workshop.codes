require "httparty"
require "tempfile"
require "nokogiri"

def get_document(url)
  puts "Fetching URL: #{url}"

  user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.100 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15"
  ]

  headers = {
    "User-Agent" => user_agents.sample
  }

  begin
    response = HTTParty.get(url, headers:)

    if response.code == 200 || response.code == 202
      Nokogiri::HTML(response.body)
    else
      puts response.code
    end
  rescue => error
    puts error
  end
end

base_url = "https://overwatch.blizzard.com/en-us"
base_document = get_document(base_url + "/heroes")

links = base_document.css(".hero-card")
hero_names = base_document.css("blz-content-block h2").map { |heading| heading.text }
output = "# This file is generated via script/get_hero_lore.rb\n\n"

links.each_with_index do |link, index|
  hero_name = hero_names[index]
  document = get_document(base_url + link.get_attribute("href"))

  lore_headings = document.css("blz-accordion[analytics-label='hero-lore'] > [slot*=label]")
  lore_entries = document.css("blz-accordion[analytics-label='hero-lore'] > [slot*='content']")

  output += "-\n  hero: \"#{hero_name}\"\n  entries:\n"

  lore_headings.each_with_index do |heading, heading_index|
    output += "    - heading: \"#{heading.text}\"\n      paragraphs:\n"

    lore_entries[heading_index].css("p").each do |paragraph|
      output += "        - \"#{paragraph.text.chomp.gsub('"', '\\"')}\"\n"
    end
  end

  sleep(2)
end

File.write("config/arrays/hero_lore.yml", output)
