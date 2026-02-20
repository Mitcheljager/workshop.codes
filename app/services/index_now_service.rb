require "net/http"
require "uri"
require "json"

class IndexNowService
  INDEX_NOW_ENDPOINT = "https://api.indexnow.org/indexnow"

  def self.submit_urls(urls)
    return unless ENV["INDEX_NOW_KEY"] && ENV["INDEX_NOW_HOST"]
    return if urls.empty?

    uri = URI.parse(INDEX_NOW_ENDPOINT)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri.request_uri, { "Content-Type" => "application/json" })
    request.body = {
      host: ENV["INDEX_NOW_HOST"],
      key: ENV["INDEX_NOW_KEY"],
      keyLocation: "https://#{ENV["INDEX_NOW_HOST"]}/#{ENV["INDEX_NOW_KEY"]}.txt",
      urlList: urls
    }.to_json

    http.request(request)
  rescue StandardError => error
    Rails.logger.error "IndexNow failed: #{error.message}"
  end
end
