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

def download_image(url, filename)
  existing_file = File.join(__dir__, "..", "app/assets/images/abilities/128", filename + File.extname(url))
  return if File.exist?(existing_file)

  response = HTTParty.get(url)

  if response.code != 200
    puts "Failed to fetch image: #{response.code}"
    return
  end

  folder = File.join(__dir__, "output")
  filepath = File.join(folder, filename + File.extname(url))

  File.open(filepath, "wb") do |file|
    file.write(response.body)
  end
rescue => error
  puts error
end

def to_slug(string)
  string.downcase.gsub(":", "").gsub(" ", "-").gsub("!", "").gsub("(", "").gsub(")", "").gsub("'", "").gsub(".", "")
end

base_url = "https://overwatch.blizzard.com/en-us"
base_document = get_document(base_url + "/heroes")

links = base_document.css(".hero-card")
hero_names = base_document.css("blz-content-block h2").map { |heading| heading.text }
output = ""

links.each_with_index do |link, index|
  hero_name = hero_names[index]
  document = get_document(base_url + link.get_attribute("href"))

  abilities = document.css(".abilities blz-tab-control")

  abilities.each do |ability|
    image = ability.at_css("blz-image").get_attribute("src")
    name = ability.get_attribute("label")

    if download_image(image, to_slug(name))
      output += "- #{name}: [#{hero_name}, Ability]\n"
    end
  end

  perks = document.css(".perks .perk-icon img")

  perks.each do |perk|
    image = perk.get_attribute("src")
    name = perk.get_attribute("alt")

    if download_image(image, to_slug(name))
      output += "- #{name}: [#{hero_name}, Perk]\n"
    end
  end

  sleep(2)
end

puts output
