module AdminHelper
  def create_date_count()
    date_counts = []
    (Date.parse("June 1 2019")...DateTime.now).each do |date|
      date_counts << { date: date.strftime("%Y-%m-%d"), value: 0 }
    end

    return date_counts
  end
end
