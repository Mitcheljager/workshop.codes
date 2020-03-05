class Ahoy::Store < Ahoy::DatabaseStore
end

# set to true for JavaScript tracking
Ahoy.api = false
Ahoy.geocode = false
Ahoy.mask_ips = true
Ahoy.cookies = false

Ahoy.server_side_visits = :only_when_needed
