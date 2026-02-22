
task assign_random_passwords_to_users_with_provider: :environment do
  users = User.where.not(provider: nil)
  index = 0
  users.find_each(batch_size: 100) do |user|
    puts "#{index + 1} out of #{users.size}..."

    random_password = SecureRandom.hex(32)

    user.password = random_password

    if user.save(touch: false)
      puts "Updated user #{user.id} with provider #{user.provider}"
    else
      puts "Failed to update user #{user.id} with provider #{user.provider}"
    end

    index += 1
  end
end
