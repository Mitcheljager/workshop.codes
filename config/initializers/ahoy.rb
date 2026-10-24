class Ahoy::Store < Ahoy::DatabaseStore
  def authenticate(data)
    # disables automatic linking of visits and users
  end
end

Ahoy.api = false
Ahoy.mask_ips = true
Ahoy.cookies = :none
Ahoy.visit_duration = 4.hours
Ahoy.visitor_duration = 4.hours
