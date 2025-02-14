require "net/http"
require "uri"
require "json"

class CloudflareCachePurgeService
  return unless ENV["CLOUDFLARE_API_TOKEN"]

  CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4/zones/#{ENV["CLOUDFLARE_ZONE_ID"]}/purge_cache"

  def self.purge_urls(urls)
    return if urls.empty?

    uri = URI.parse(CLOUDFLARE_API_URL)
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{ENV["CLOUDFLARE_API_TOKEN"]}"
    request["Content-Type"] = "application/json"
    request.body = { files: urls }.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end

    Rails.logger.info "Cloudflare purge response: #{response.body}"
    JSON.parse(response.body)
  rescue StandardError => error
    Rails.logger.error "Cloudflare cache purge failed: #{error.message}"
  end
end
